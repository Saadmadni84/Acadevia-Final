import Dexie, { type EntityTable } from 'dexie';

interface PendingSyncItem {
  id?: number;
  type: string;
  data: Record<string, unknown>;
  timestamp: string;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
}

interface CachedCourse {
  id: string;
  courseData: Record<string, unknown>;
  cachedAt: string;
}

interface CachedLesson {
  id: string;
  lessonData: Record<string, unknown>;
  cachedAt: string;
}

interface OfflineQuizAttempt {
  id?: number;
  quizId: string;
  answers: Record<string, unknown>[];
  score: number;
  timestamp: string;
}

interface DownloadedVideo {
  id: string;
  lessonId: string;
  quality: string;
  size: number;
  downloadedAt: string;
}

interface UserNote {
  id?: number;
  lessonId: string;
  content: string;
  updatedAt: string;
}

class AcadeviaDB extends Dexie {
  pendingSyncQueue!: EntityTable<PendingSyncItem, 'id'>;
  cachedCourses!: EntityTable<CachedCourse, 'id'>;
  cachedLessons!: EntityTable<CachedLesson, 'id'>;
  offlineQuizAttempts!: EntityTable<OfflineQuizAttempt, 'id'>;
  downloadedVideos!: EntityTable<DownloadedVideo, 'id'>;
  userNotes!: EntityTable<UserNote, 'id'>;

  constructor() {
    super('AcadeviaDB');
    this.version(1).stores({
      pendingSyncQueue: '++id, type, status, timestamp',
      cachedCourses: 'id, cachedAt',
      cachedLessons: 'id, cachedAt',
      offlineQuizAttempts: '++id, quizId, timestamp',
      downloadedVideos: 'id, lessonId, quality',
      userNotes: '++id, lessonId, updatedAt',
    });
  }
}

export const db = new AcadeviaDB();
