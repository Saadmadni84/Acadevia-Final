import apiClient from './api.client';
import type { Notification, NotificationPreferences } from '@/types/notification.types';
import type { ApiResponse, PaginatedResponse } from '@/types/common.types';

export const notificationService = {
  list: (params?: { page?: number; size?: number }) =>
    apiClient.get<ApiResponse<PaginatedResponse<Notification>>>('/api/v1/notifications', { params }),
  markRead: (id: string) =>
    apiClient.put<ApiResponse<void>>(`/api/v1/notifications/${id}/read`),
  markAllRead: () =>
    apiClient.put<ApiResponse<void>>('/api/v1/notifications/read-all'),
  getPreferences: () =>
    apiClient.get<ApiResponse<NotificationPreferences>>('/api/v1/notifications/preferences'),
  updatePreferences: (data: Partial<NotificationPreferences>) =>
    apiClient.put<ApiResponse<NotificationPreferences>>('/api/v1/notifications/preferences', data),
};
