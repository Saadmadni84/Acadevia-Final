import apiClient from './api.client';
import type { StudentAnalytics, AdminAnalytics } from '@/types/analytics.types';
import type { ApiResponse } from '@/types/common.types';

export const analyticsService = {
  getStudentAnalytics: () =>
    apiClient.get<ApiResponse<StudentAnalytics>>('/api/v1/analytics/student'),
  getAdminAnalytics: () =>
    apiClient.get<ApiResponse<AdminAnalytics>>('/api/v1/analytics/admin'),
};
