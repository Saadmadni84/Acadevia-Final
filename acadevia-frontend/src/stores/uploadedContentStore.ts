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
    id: 'cnt-seed-1',
    title: 'Metals and Non-metals Comprehensive Notes & Reaction Series',
    description: 'Complete chapter revision notes covering physical and chemical properties, reactivity series, and extraction of metals.',
    cloudinaryUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/examples/learning/helloworld.pdf',
    thumbnailUrl: '',
    subject: 'Science',
    classGrade: 10,
    chapter: 'Metals and Non-metals',
    language: 'en',
    uploadedBy: 'Dr. Vikram Malhotra',
    uploadedAt: '2026-09-02T10:00:00.000Z',
    fileSize: 2457600,
    contentType: 'PDF',
    fileName: 'class10_science_metals.pdf',
    mimeType: 'application/pdf',
  },
  {
    id: 'cnt-seed-2',
    title: 'Reactivity Series of Metals & Extraction Video Lecture',
    description: 'Complete video breakdown of the metal reactivity series and electrolytic reduction methods.',
    cloudinaryUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80',
    subject: 'Science',
    classGrade: 10,
    chapter: 'Metals and Non-metals',
    language: 'en',
    duration: 15,
    uploadedBy: 'Dr. Vikram Malhotra',
    uploadedAt: '2026-09-02T10:15:00.000Z',
    fileSize: 15728640,
    contentType: 'VIDEO',
    fileName: 'metals_reactivity_lecture.mp4',
    mimeType: 'video/mp4',
  },
  {
    id: 'cnt-seed-3',
    title: 'Reactivity Series of Metals Reference Diagram',
    description: 'High-resolution diagram illustrating reactivity order of metals with oxygen, water, and acids.',
    cloudinaryUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=300&q=80',
    subject: 'Science',
    classGrade: 10,
    chapter: 'Metals and Non-metals',
    language: 'en',
    uploadedBy: 'Dr. Vikram Malhotra',
    uploadedAt: '2026-09-02T10:30:00.000Z',
    fileSize: 1048576,
    contentType: 'IMAGE',
    fileName: 'reactivity_diagram.png',
    mimeType: 'image/png',
  },
];

function getApiUrl(path: string): string {
  if (typeof window !== 'undefined' && window.location?.origin && window.location.origin !== 'null') {
    return window.location.origin + path;
  }
  return 'http://localhost:5173' + path;
}

let memoryItems: UploadedContentItem[] = [...SEED_CONTENT_ITEMS];

function getAll(): UploadedContentItem[] {
  return memoryItems;
}

export const uploadedContentStore = {
  /** Get all uploaded content */
  getAll,

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

  /** Get content for a specific chapter */
  getByChapter(classGrade: number, subject: string, chapter: string): UploadedContentItem[] {
    return memoryItems.filter(
      (v) =>
        v.classGrade === classGrade &&
        v.subject.toLowerCase() === subject.toLowerCase() &&
        v.chapter.toLowerCase() === chapter.toLowerCase(),
    );
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
          memoryItems = json.data;
          window.dispatchEvent(new CustomEvent('acadevia_content_updated'));
        }
      }
    } catch {
      // Offline fallback
    }
  },
};

// Initial sync in browser runtime & auto-revalidation polling
if (typeof window !== 'undefined') {
  uploadedContentStore.syncFromBackend().catch(() => {});

  window.addEventListener('focus', () => {
    uploadedContentStore.syncFromBackend().catch(() => {});
  });

  setInterval(() => {
    uploadedContentStore.syncFromBackend().catch(() => {});
  }, 5000);
}

