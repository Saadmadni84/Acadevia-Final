export interface DownloadManifest { id: string; lessonId: string; title: string; quality: string; totalSize: number; totalChunks: number; completedChunks: number; status: string; createdAt: string; }
export interface DownloadChunk { index: number; size: number; checksum: string; url: string; }
export interface DownloadProgress { manifestId: string; progress: number; speed: number; eta: number; completedChunks: number; totalChunks: number; }
