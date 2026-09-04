import { useAuthStore } from '@/stores/useAuthStore';

export interface ContinueLearningItem {
  id: string;
  studentId: string;
  contentId: string;
  courseId?: string;
  subject: string;
  chapter: string;
  classGrade: number;
  title: string;
  description: string;
  contentType: 'VIDEO' | 'PDF' | 'IMAGE' | string;
  fileUrl?: string;
  thumbnailUrl?: string;
  lastPositionSeconds: number;
  durationSeconds: number;
  progressPercent: number;
  completed: boolean;
  lastWatchedAt: string;
  timeLeft: string;
}

export interface SaveProgressParams {
  studentId?: string;
  contentId: string;
  courseId?: string;
  subject: string;
  chapter: string;
  classGrade?: number;
  title: string;
  description?: string;
  contentType?: string;
  fileUrl?: string;
  thumbnailUrl?: string;
  lastPositionSeconds: number;
  durationSeconds: number;
  progressPercent?: number;
  completed?: boolean;
}

function getApiUrl(path: string): string {
  if (typeof window !== 'undefined' && window.location?.origin && window.location.origin !== 'null') {
    return window.location.origin + path;
  }
  return 'http://localhost:5173' + path;
}

function formatRemainingTime(durationSec: number, lastPosSec: number): string {
  const dur = Number(durationSec) || 0;
  const pos = Number(lastPosSec) || 0;
  if (!dur) return 'In progress';
  const remaining = Math.max(0, dur - pos);
  if (remaining === 0) return 'Completed ✓';
  const mins = Math.ceil(remaining / 60);
  return `${mins} min left`;
}

function getLocalStorageKey(studentId: string): string {
  return `acadevia_learning_progress_${studentId}`;
}

function readLocalProgress(studentId: string): ContinueLearningItem[] {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(getLocalStorageKey(studentId));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.sort(
          (a, b) => new Date(b.lastWatchedAt).getTime() - new Date(a.lastWatchedAt).getTime()
        );
      }
    }
  } catch (err) {
    console.warn('[learningProgressService] Failed to read local storage:', err);
  }
  return [];
}

function writeLocalProgress(studentId: string, items: ContinueLearningItem[]): void {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(getLocalStorageKey(studentId), JSON.stringify(items));
  } catch (err) {
    console.warn('[learningProgressService] Failed to write local storage:', err);
  }
}

export const learningProgressService = {
  /**
   * Fetch recent learning progress items for authenticated student
   * Prioritized strictly by lastWatchedAt DESC from the backend database
   */
  async getRecentProgress(studentId?: string, limit: number = 6): Promise<ContinueLearningItem[]> {
    const authState = useAuthStore.getState();
    const authUser = authState.user;
    const resolvedId = String(studentId || authUser?.id || '20');
    const token = authState.accessToken;

    try {
      if (typeof window !== 'undefined') {
        const headers: Record<string, string> = {
          'X-User-Id': resolvedId,
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        console.log('[learningProgressService] Requesting Continue Learning from:', getApiUrl(`/api/v1/student/learning/continue?studentId=${resolvedId}&limit=${limit}`), 'with headers:', headers);
        const res = await fetch(getApiUrl(`/api/v1/student/learning/continue?studentId=${resolvedId}&limit=${limit}`), {
          headers,
        });
        console.log('[learningProgressService] Continue Learning HTTP status:', res.status);

        if (res.ok) {
          const json = await res.json();
          console.log('[learningProgressService] Continue Learning API JSON response:', json);
          if (json?.success && Array.isArray(json.data)) {
            const serverItems: ContinueLearningItem[] = json.data;

            // Update local storage cache with authoritative backend data
            writeLocalProgress(resolvedId, serverItems);
            return serverItems;
          }
        }
      }
    } catch (err) {
      console.warn('[learningProgressService] Backend fetch failed, using cached fallback:', err);
    }

    // Fallback to local storage cache only when offline or backend unreachable
    return readLocalProgress(resolvedId).slice(0, limit);
  },

  /**
   * Save or update progress for any content item (video, lesson, document)
   */
  async saveProgress(params: SaveProgressParams): Promise<ContinueLearningItem> {
    const authState = useAuthStore.getState();
    const authUser = authState.user;
    const studentId = String(params.studentId || authUser?.id || '20');
    const token = authState.accessToken;
    const contentId = String(params.contentId);

    const duration = Math.max(0, Math.round(Number(params.durationSeconds) || 0));
    const lastPos = Math.max(0, Math.round(Number(params.lastPositionSeconds) || 0));

    let progressPct = Number(params.progressPercent);
    if (isNaN(progressPct) || progressPct === undefined || progressPct === null) {
      progressPct = duration > 0 ? Math.min(100, Math.round((lastPos / duration) * 100)) : 0;
    } else {
      progressPct = Math.min(100, Math.max(0, Math.round(progressPct)));
    }

    const completed = params.completed === true || (duration > 0 && lastPos >= duration - 0.5) || progressPct >= 90;
    const lastWatchedAt = new Date().toISOString();

    const record: ContinueLearningItem = {
      id: `prog-${studentId}-${contentId}`,
      studentId,
      contentId,
      courseId: params.courseId || '',
      subject: params.subject,
      chapter: params.chapter,
      classGrade: Number(params.classGrade || authUser?.classGrade || 10),
      title: params.title,
      description: params.description || '',
      contentType: params.contentType || 'VIDEO',
      fileUrl: params.fileUrl || '',
      thumbnailUrl: params.thumbnailUrl || '',
      lastPositionSeconds: lastPos,
      durationSeconds: duration,
      progressPercent: progressPct,
      completed,
      lastWatchedAt,
      timeLeft: formatRemainingTime(duration, lastPos),
    };

    // 1. Immediately cache to local storage
    const current = readLocalProgress(studentId);
    const existingIdx = current.findIndex((c) => c.contentId === contentId);
    if (existingIdx >= 0) {
      current[existingIdx] = record;
    } else {
      current.push(record);
    }
    current.sort((a, b) => new Date(b.lastWatchedAt).getTime() - new Date(a.lastWatchedAt).getTime());
    writeLocalProgress(studentId, current);

    // 2. Dispatch event to update reactive listeners across dashboard and pages
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('acadevia_progress_updated', { detail: record }));
    }

    // 3. Persist to backend database API with keepalive guaranteed delivery
    const isTest = typeof window === 'undefined' || Boolean((globalThis as any)?.__vitest_worker__);
    if (typeof window !== 'undefined' && !isTest) {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-User-Id': studentId,
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      try {
        await fetch(getApiUrl('/api/v1/learning-progress'), {
          method: 'POST',
          headers,
          body: JSON.stringify(record),
          keepalive: true, // Guarantees network request completes even across page unmount/navigation
        });
      } catch (err) {
        console.warn('[learningProgressService] Failed to sync progress to server:', err);
      }
    }

    return record;
  },

  /**
   * Get student's saved progress for a specific content item to resume playback
   */
  async getContentProgress(contentId: string, studentId?: string): Promise<ContinueLearningItem | null> {
    const authState = useAuthStore.getState();
    const authUser = authState.user;
    const resolvedId = String(studentId || authUser?.id || '20');
    const token = authState.accessToken;

    try {
      if (typeof window !== 'undefined') {
        const headers: Record<string, string> = {
          'X-User-Id': resolvedId,
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(getApiUrl(`/api/v1/learning-progress/${encodeURIComponent(contentId)}`), {
          headers,
        });

        if (res.ok) {
          const json = await res.json();
          if (json?.success && json.data) {
            return json.data;
          }
        }
      }
    } catch {
      // Fall through to local fallback
    }

    const local = readLocalProgress(resolvedId);
    return local.find((i) => i.contentId === contentId) || null;
  },
};
