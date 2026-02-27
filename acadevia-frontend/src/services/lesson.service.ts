import apiClient from './api.client';
import type { Lesson, LessonProgress } from '@/types/lesson.types';
import type { ApiResponse } from '@/types/common.types';

export const lessonService = {
  getById: (id: string) =>
    apiClient.get<ApiResponse<Lesson>>(`/api/v1/lessons/${id}`),
  markComplete: (id: string) =>
    apiClient.post<ApiResponse<{ completed: boolean; xpEarned: number }>>(`/api/v1/lessons/${id}/complete`),
  updateProgress: (id: string, data: Partial<LessonProgress>) =>
    apiClient.put<ApiResponse<LessonProgress>>(`/api/v1/lessons/${id}/progress`, data),
};
