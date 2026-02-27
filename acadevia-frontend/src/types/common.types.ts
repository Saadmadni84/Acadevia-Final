export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface SelectOption {
  value: string;
  label: string;
}

export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN';
export type SyncStatus = 'SYNCED' | 'SYNCING' | 'OFFLINE' | 'ERROR';
export type DownloadStatus = 'PENDING' | 'DOWNLOADING' | 'PAUSED' | 'COMPLETED' | 'FAILED';
export type QuizDifficulty = 'EASY' | 'MEDIUM' | 'HARD';
