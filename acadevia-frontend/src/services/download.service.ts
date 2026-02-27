import apiClient from './api.client';
import type { DownloadManifest, DownloadChunk } from '@/types/download.types';
import type { ApiResponse } from '@/types/common.types';

export const downloadService = {
  initiate: (lessonId: string, quality: string) =>
    apiClient.post<ApiResponse<DownloadManifest>>('/api/v1/downloads/initiate', { lessonId, quality }),
  getChunks: (manifestId: string) =>
    apiClient.get<ApiResponse<DownloadChunk[]>>(`/api/v1/downloads/${manifestId}/chunks`),
  completeChunk: (manifestId: string, chunkIndex: number, checksum: string) =>
    apiClient.post<ApiResponse<void>>(`/api/v1/downloads/${manifestId}/chunks/${chunkIndex}/complete`, { checksum }),
  pause: (manifestId: string) =>
    apiClient.put<ApiResponse<void>>(`/api/v1/downloads/${manifestId}/pause`),
  resume: (manifestId: string) =>
    apiClient.put<ApiResponse<void>>(`/api/v1/downloads/${manifestId}/resume`),
  cancel: (manifestId: string) =>
    apiClient.delete<ApiResponse<void>>(`/api/v1/downloads/${manifestId}`),
};
