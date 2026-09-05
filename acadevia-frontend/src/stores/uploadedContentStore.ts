/**
 * Uploaded Content Store
 *
 * Persists content metadata (Video, PDF, Image) in localStorage after teacher uploads.
 * Students can then browse uploaded content by class/subject/chapter.
 */

export type StoredContentType = 'VIDEO' | 'PDF' | 'IMAGE';

export interface UploadedContentItem {
  id: string;
  title: string;
  description: string;
  cloudinaryUrl: string;
  downloadUrl?: string;
  downloadOptions?: Array<{ quality: string; label: string; fileSizeMb?: number; downloadUrl: string }>;
  cloudinaryPublicId?: string;
  thumbnailUrl: string;
  subject: string;
  classGrade: number;
  chapter: string;
  language: string;
  duration?: number;
  uploadedBy: string;
  uploadedAt: string;
  fileSize: number;
  contentType?: StoredContentType;
  fileName?: string;
  mimeType?: string;
}

// Backward-compatibility alias
export type UploadedVideo = UploadedContentItem;

// In-memory store synchronized with MySQL backend API (independent of LocalStorage)

const SEED_CONTENT_ITEMS: UploadedContentItem[] = [
  {
    id: '3',
    title: 'Real Numbers',
    description: "Comprehensive Chapter 1 coverage of Real Numbers for Class 10 CBSE/State Board. Covers Euclid's Division Lemma, Fundamental Theorem of Arithmetic, and proofs of irrationality.",
    cloudinaryUrl: '/api/v1/content/videos/3/stream',
    downloadUrl: '/api/v1/content/videos/3/download',
    downloadOptions: [
      {
        quality: '720p',
        label: '720p HD (Original)',
        fileSizeMb: 408.83,
        downloadUrl: '/api/v1/content/videos/3/download',
      },
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80',
    subject: 'Mathematics',
    classGrade: 10,
    chapter: 'Real Numbers',
    language: 'en',
    duration: 4596,
    uploadedBy: 'Faculty',
    uploadedAt: '2026-09-04T12:00:00.000Z',
    fileSize: 428691985,
    contentType: 'VIDEO',
    fileName: 'Real Numbers Class 10  Maths Full chapter in One Shot  NCERT Chapter 1  CBSE New Syllabus  10th_720p.mp4',
    mimeType: 'video/mp4',
  },
];

function getApiUrl(path: string): string {
  if (typeof window !== 'undefined' && window.location?.origin && window.location.origin !== 'null') {
    return window.location.origin + path;
  }
  return 'http://localhost:5173' + path;
}

let memoryItems: UploadedContentItem[] = [...SEED_CONTENT_ITEMS];

function normalizeChapter(name: string): string {
  return (name || '').toLowerCase().replace(/^chapter\s*\d+[\s:.-]*/i, '').trim();
}

function getAll(): UploadedContentItem[] {
  return memoryItems;
}

export const uploadedContentStore = {
  /** Get all uploaded content */
  getAll,

  /** Normalize chapter string */
  normalizeChapter,

  /** Add a new content entry */
  add(item: UploadedContentItem): void {
    const existingIdx = memoryItems.findIndex((x) => x.id === item.id);
    if (existingIdx >= 0) {
      memoryItems[existingIdx] = item;
    } else {
      memoryItems.push(item);
    }
    if (typeof window !== 'undefined') {
      fetch(getApiUrl('/api/v1/content/items'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      }).catch((err) => {
        console.warn('Failed to persist content item to backend API:', err);
      });
      window.dispatchEvent(new CustomEvent('acadevia_content_updated'));
    }
  },

  /** Get content for a specific class and subject */
  getByClassAndSubject(classGrade: number, subject: string): UploadedContentItem[] {
    return memoryItems.filter(
      (v) => v.classGrade === classGrade && v.subject.toLowerCase() === subject.toLowerCase(),
    );
  },

  /** Get content for a specific chapter with flexible normalized matching */
  getByChapter(classGrade: number, subject: string, chapter: string): UploadedContentItem[] {
    const targetNorm = normalizeChapter(chapter);
    return memoryItems.filter((v) => {
      if (v.classGrade !== classGrade) return false;
      if (v.subject.toLowerCase() !== subject.toLowerCase()) return false;
      if (!targetNorm) return true;
      const itemNorm = normalizeChapter(v.chapter);
      return itemNorm === targetNorm || itemNorm.includes(targetNorm) || targetNorm.includes(itemNorm);
    });
  },

  /** Get unique classes that have content */
  getAvailableClasses(): number[] {
    const classes = new Set(memoryItems.map((v) => v.classGrade));
    return Array.from(classes).sort((a, b) => a - b);
  },

  /** Get unique subjects for a class */
  getSubjectsForClass(classGrade: number): string[] {
    const subjects = new Set(
      memoryItems
        .filter((v) => v.classGrade === classGrade)
        .map((v) => v.subject),
    );
    return Array.from(subjects).sort();
  },

  /** Get unique chapters for a class+subject */
  getChaptersForSubject(classGrade: number, subject: string): string[] {
    const chapters = new Set(
      memoryItems
        .filter(
          (v) => v.classGrade === classGrade && v.subject.toLowerCase() === subject.toLowerCase(),
        )
        .map((v) => v.chapter),
    );
    return Array.from(chapters);
  },

  /** Remove a content item by id */
  remove(id: string): void {
    memoryItems = memoryItems.filter((v) => v.id !== id);
    if (typeof window !== 'undefined') {
      fetch(getApiUrl(`/api/v1/content/items/${id}`), { method: 'DELETE' }).catch(() => {});
      window.dispatchEvent(new CustomEvent('acadevia_content_updated'));
    }
  },

  /** Clear all */
  clear(): void {
    memoryItems = [];
  },

  /** Synchronize content items from MySQL database API */
  async syncFromBackend(): Promise<void> {
    try {
      if (typeof window === 'undefined') return;
      const res = await fetch(getApiUrl('/api/v1/content/items'));
      if (res.ok) {
        const json = await res.json();
        if (json?.success && Array.isArray(json.data) && json.data.length > 0) {
          const hasChanged =
            memoryItems.length !== json.data.length ||
            memoryItems.some((m, idx) => m.id !== json.data[idx]?.id);

          if (hasChanged) {
            memoryItems = json.data;
            window.dispatchEvent(new CustomEvent('acadevia_content_updated'));
          }
        }
      }
    } catch {
      // Offline fallback
    }
  },
};

// Initial sync in browser runtime & efficient auto-revalidation polling (45s)
if (typeof window !== 'undefined') {
  uploadedContentStore.syncFromBackend().catch(() => {});

  window.addEventListener('focus', () => {
    uploadedContentStore.syncFromBackend().catch(() => {});
  });

  setInterval(() => {
    uploadedContentStore.syncFromBackend().catch(() => {});
  }, 45000);
}

