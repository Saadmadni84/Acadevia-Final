export type DownloadStatus =
  | 'pending'
  | 'downloading'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type DownloadType = 'video' | 'document' | 'quiz';

export type VideoQuality = '360p' | '480p' | '720p';

export interface OfflineDownloadItem {
  id: string;
  lessonId: string;
  courseId: string;
  courseName: string;
  subject: string;
  classGrade: number;
  chapter: string;
  title: string;
  fileType: DownloadType;
  quality: VideoQuality;
  totalBytes: number;
  downloadedBytes: number;
  status: DownloadStatus;
  speedBytesPerSec: number;
  etaSeconds: number;
  errorMessage?: string;
  downloadUrl: string;
  localBlobKey?: string;
  downloadedAt?: string;
  thumbnailUrl?: string;
  author?: string;
}

export interface StorageBreakdown {
  usedBytes: number;
  totalBytes: number;
  videoBytes: number;
  documentBytes: number;
  quizBytes: number;
  videosCount: number;
  documentsCount: number;
  completedCount: number;
}

export interface QualityOption {
  quality: VideoQuality;
  label: string;
  badge: string;
  sizeMultiplier: number; // e.g. 0.5 for 360p, 1 for 480p, 2 for 720p
  description: string;
}

export const QUALITY_PRESETS: Record<VideoQuality, QualityOption> = {
  '360p': {
    quality: '360p',
    label: '360p',
    badge: 'Low Data',
    sizeMultiplier: 0.5,
    description: 'Best for limited or mobile data connections (~25 MB)',
  },
  '480p': {
    quality: '480p',
    label: '480p',
    badge: 'Recommended',
    sizeMultiplier: 1.0,
    description: 'Crisp balance between clarity and file size (~50 MB)',
  },
  '720p': {
    quality: '720p',
    label: '720p',
    badge: 'HD Clarity',
    sizeMultiplier: 2.0,
    description: 'High-definition viewing for tablets & laptops (~100 MB)',
  },
};

export interface DownloadManifest {
  id: string;
  lessonId: string;
  title: string;
  quality: string;
  totalSize: number;
  totalChunks: number;
  completedChunks: number;
  status: string;
  createdAt: string;
}

export interface DownloadChunk {
  index: number;
  size: number;
  checksum: string;
  url: string;
}

export interface DownloadProgress {
  manifestId: string;
  progress: number;
  speed: number;
  eta: number;
  completedChunks: number;
  totalChunks: number;
}
