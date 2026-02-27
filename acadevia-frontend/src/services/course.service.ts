import apiClient from './api.client';
import type { Course, CourseDetail, EnrollRequest } from '@/types/course.types';
import type { ApiResponse, PaginatedResponse } from '@/types/common.types';

export const courseService = {
  list: (params?: { page?: number; size?: number; subject?: string; classLevel?: string; search?: string; sort?: string }) =>
    apiClient.get<ApiResponse<PaginatedResponse<Course>>>('/api/v1/courses', { params }),
  getById: (id: string) =>
    apiClient.get<ApiResponse<CourseDetail>>(`/api/v1/courses/${id}`),
  enroll: (data: EnrollRequest) =>
    apiClient.post<ApiResponse<{ enrolled: boolean }>>('/api/v1/courses/enroll', data),
  getEnrolled: () =>
    apiClient.get<ApiResponse<Course[]>>('/api/v1/courses/enrolled'),
  getProgress: (courseId: string) =>
    apiClient.get<ApiResponse<{ progress: number; completedLessons: number; totalLessons: number }>>(`/api/v1/courses/${courseId}/progress`),
};
