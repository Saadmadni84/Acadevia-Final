import apiClient from './api.client';
import type { Game, GameScore } from '@/types/game.types';
import type { ApiResponse } from '@/types/common.types';

export const gameService = {
  list: (params?: { subject?: string }) =>
    apiClient.get<ApiResponse<Game[]>>('/api/v1/games', { params }),
  getById: (id: string) =>
    apiClient.get<ApiResponse<Game>>(`/api/v1/games/${id}`),
  submitScore: (gameId: string, data: { score: number; timeTaken: number }) =>
    apiClient.post<ApiResponse<GameScore>>(`/api/v1/games/${gameId}/score`, data),
};
