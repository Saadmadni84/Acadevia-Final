import apiClient from './api.client';
import type { GamificationProfile, Badge, XPEvent } from '@/types/gamification.types';
import type { ApiResponse, PaginatedResponse } from '@/types/common.types';

export const gamificationService = {
  getProfile: () =>
    apiClient.get<ApiResponse<GamificationProfile>>('/api/v1/gamification/profile'),
  getBadges: () =>
    apiClient.get<ApiResponse<Badge[]>>('/api/v1/gamification/badges'),
  getXPHistory: (params?: { page?: number; size?: number }) =>
    apiClient.get<ApiResponse<PaginatedResponse<XPEvent>>>('/api/v1/gamification/xp-history', { params }),
};
