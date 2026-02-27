import apiClient from './api.client';
import type { UserProfile, UserPreferences } from '@/types/user.types';
import type { ApiResponse } from '@/types/common.types';

export const userService = {
  getProfile: () =>
    apiClient.get<ApiResponse<UserProfile>>('/api/v1/users/me'),
  updateProfile: (data: Partial<UserProfile>) =>
    apiClient.put<ApiResponse<UserProfile>>('/api/v1/users/me', data),
  getPreferences: () =>
    apiClient.get<ApiResponse<UserPreferences>>('/api/v1/users/me/preferences'),
  updatePreferences: (data: Partial<UserPreferences>) =>
    apiClient.put<ApiResponse<UserPreferences>>('/api/v1/users/me/preferences', data),
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return apiClient.post<ApiResponse<{ avatarUrl: string }>>('/api/v1/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
