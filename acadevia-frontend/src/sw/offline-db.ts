import Dexie, { type EntityTable } from 'dexie';

// ── Table interfaces ────────────────────────────────────────────────

export interface PendingSyncItem {
  id?: number;
  type: string;
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  payload: unknown;
  createdAt: string;
  retryCount: number;
}

export interface CachedCourse {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  instructorId: string;
  category: string;
  data: unknown;
  cachedAt: string;
}

export interface CachedLesson {
  id: string;
  courseId: string;
  title: string;
  type: string;
  orderIndex: number;
  data: unknown;
  cachedAt: string;
}

export interface OfflineQuizAttempt {
  id?: number;
  quizId: string;
  userId: string;
  answers: Array<{ questionId: string; selectedOption: number }>;
  score: number | null;
  startedAt: string;
  completedAt: string | null;
  synced: boolean;
}

export interface OfflineGameProgress {
  id?: number;
  gameId: string;
  userId: string;
  progress: unknown;
  score: number;
  updatedAt: string;
  synced: boolean;
}

export interface OfflineXP {
  id?: number;
  userId: string;
  amount: number;
  source: string;
  sourceId: string;
  earnedAt: string;
  synced: boolean;
}

export interface DownloadedVideo {
  lessonId: string;
  quality: string;
  blob: Blob;
  mimeType: string;
  fileSize: number;
  downloadedAt: string;
}

export interface UserNote {
  id?: number;
  userId: string;
  lessonId: string;
  content: string;
  timestamp: number | null;
  createdAt: string;
  updatedAt: string;
  synced: boolean;
}

export interface UserBookmark {
  id?: number;
  userId: string;
  lessonId: string;
  courseId: string;
  title: string;
  timestamp: number | null;
  createdAt: string;
  synced: boolean;
}

// ── Database ────────────────────────────────────────────────────────

class OfflineDatabase extends Dexie {
  pendingSyncQueue!: EntityTable<PendingSyncItem, 'id'>;
  cachedCourses!: EntityTable<CachedCourse, 'id'>;
  cachedLessons!: EntityTable<CachedLesson, 'id'>;
  offlineQuizAttempts!: EntityTable<OfflineQuizAttempt, 'id'>;
  offlineGameProgress!: EntityTable<OfflineGameProgress, 'id'>;
  offlineXP!: EntityTable<OfflineXP, 'id'>;
  downloadedVideos!: EntityTable<DownloadedVideo, 'lessonId'>;
  userNotes!: EntityTable<UserNote, 'id'>;
  userBookmarks!: EntityTable<UserBookmark, 'id'>;

  constructor() {
    super('AcadeviaOfflineDB');

    this.version(1).stores({
      pendingSyncQueue: '++id, type, endpoint, createdAt',
      cachedCourses: 'id, category, instructorId, cachedAt',
      cachedLessons: 'id, courseId, orderIndex, cachedAt',
      offlineQuizAttempts: '++id, quizId, userId, synced, startedAt',
      offlineGameProgress: '++id, gameId, userId, synced, updatedAt',
      offlineXP: '++id, userId, source, synced, earnedAt',
      downloadedVideos: 'lessonId, quality, downloadedAt',
      userNotes: '++id, userId, lessonId, synced, updatedAt',
      userBookmarks: '++id, userId, lessonId, courseId, synced, createdAt',
    });
  }
}

export const offlineDb = new OfflineDatabase();
export default offlineDb;
