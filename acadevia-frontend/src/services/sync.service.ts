import apiClient from './api.client';
import type { SyncBatchRequest, SyncBatchResponse } from '@/types/sync.types';
import type { ApiResponse } from '@/types/common.types';

export const syncService = {
  batchSync: (data: SyncBatchRequest) =>
    apiClient.post<ApiResponse<SyncBatchResponse>>('/api/v1/sync/batch', data),
  getStatus: () =>
    apiClient.get<ApiResponse<{ pendingCount: number; lastSyncAt: string }>>('/api/v1/sync/status'),
};
