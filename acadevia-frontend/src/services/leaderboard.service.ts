import apiClient from './api.client';
import type { LeaderboardData, LeaderboardScope } from '@/types/leaderboard.types';
import type { ApiResponse } from '@/types/common.types';

export const leaderboardService = {
  get: (scope: LeaderboardScope, params?: { classLevel?: string; page?: number; size?: number }) =>
    apiClient.get<ApiResponse<LeaderboardData>>(`/api/v1/leaderboard/${scope.toLowerCase()}`, { params }),
};
