import apiClient from './api.client';
import { fileStorageService } from './fileStorage.service';
import { dataService } from './data.service';
import { useAuthStore } from '@/stores/useAuthStore';
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

  /**
   * Upload and persist user avatar image
   * Validates format (JPG/PNG/WEBP) & size (<= 5MB), stores binary record,
   * calls backend /api/v1/users/me/avatar endpoint, and updates client store.
   */
  uploadAvatar: async (file: File): Promise<string> => {
    // 1. Validation
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      throw new Error('Profile photo must be a JPG, PNG, or WEBP image.');
    }
    const maxSize = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxSize) {
      throw new Error('Profile photo must be smaller than 5 MB.');
    }

    const state = useAuthStore.getState();
    const currentUser = state.user;
    const userId = currentUser?.id || 'guest';
    const uniqueFileId = `avatar_${userId}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // 2. Persist binary blob permanently in client FileStorageService (IndexedDB)
    const storedRecord = await fileStorageService.storeFile(uniqueFileId, file, file.name);
    let avatarUrl = storedRecord.dataUrl || URL.createObjectURL(storedRecord.blob);

    // 3. Attempt backend multipart upload to sync with user-service
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await apiClient.post<ApiResponse<{ avatarUrl: string }>>('/api/v1/users/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.data?.avatarUrl && !res.data.data.avatarUrl.includes('default.png')) {
        avatarUrl = res.data.data.avatarUrl;
      }
    } catch {
      // Backend offline or local mode: avatarUrl safely preserved in indexedDB
    }

    // 4. Update dataService user record
    if (currentUser?.id) {
      const existing = dataService.getUserById(String(currentUser.id)) || (currentUser.email ? dataService.getUserByEmail(currentUser.email) : undefined);
      if (existing) {
        dataService.upsertUser({ ...existing, avatarUrl });
      } else {
        dataService.upsertUser({
          id: String(currentUser.id),
          email: currentUser.email || '',
          fullName: currentUser.fullName || 'Student',
          role: (currentUser.role as any) || 'STUDENT',
          schoolName: currentUser.schoolName || '',
          classGrade: currentUser.classGrade ? Number(currentUser.classGrade) : undefined,
          stateName: currentUser.stateName,
          cityName: currentUser.cityName,
          avatarUrl,
          totalXP: 0,
          currentLevel: 1,
          currentStreak: 0,
          lessonsCompleted: 0,
          joinDate: new Date().toISOString().split('T')[0],
        });
      }
    }

    // 5. Update auth store globally
    if (currentUser) {
      state.setUser({
        ...currentUser,
        avatarUrl,
      });
    }

    return avatarUrl;
  },
};

