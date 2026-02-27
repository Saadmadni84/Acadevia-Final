import apiClient from './api.client';
import type { Quiz, QuizQuestion, QuizAttempt, QuizResult } from '@/types/quiz.types';
import type { ApiResponse } from '@/types/common.types';

export const quizService = {
  getById: (id: string) =>
    apiClient.get<ApiResponse<Quiz>>(`/api/v1/quizzes/${id}`),
  getQuestions: (quizId: string) =>
    apiClient.get<ApiResponse<QuizQuestion[]>>(`/api/v1/quizzes/${quizId}/questions`),
  submit: (quizId: string, data: QuizAttempt) =>
    apiClient.post<ApiResponse<QuizResult>>(`/api/v1/quizzes/${quizId}/submit`, data),
  getResults: (quizId: string) =>
    apiClient.get<ApiResponse<QuizResult[]>>(`/api/v1/quizzes/${quizId}/results`),
};
