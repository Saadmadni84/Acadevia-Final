import apiClient from './api.client';
import type { State, City, School } from '@/types/school.types';
import type { ApiResponse } from '@/types/common.types';

export const schoolService = {
  getStates: () =>
    apiClient.get<ApiResponse<State[]>>('/api/v1/schools/states'),
  getCities: (stateId: string) =>
    apiClient.get<ApiResponse<City[]>>(`/api/v1/schools/states/${stateId}/cities`),
  getSchools: (cityId: string) =>
    apiClient.get<ApiResponse<School[]>>(`/api/v1/schools/cities/${cityId}/schools`),
};
