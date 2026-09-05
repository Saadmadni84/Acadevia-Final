import apiClient from './api.client';
import type { NcertChaptersResponse, AiQuizGenerateParams, GeneratedQuizResponse } from '@/types/aiQuiz.types';
import type { ApiResponse } from '@/types/common.types';

export const aiQuizService = {
  async getAvailableChapters(classGrade: number = 9, subject: string = 'Mathematics'): Promise<NcertChaptersResponse> {
    const res = await apiClient.get<ApiResponse<NcertChaptersResponse>>('/api/v1/ai/ncert/chapters', {
      params: { classGrade, subject },
    });
    const payload = res.data as any;
    return payload.data ?? payload;
  },

  async generateAiQuiz(params: AiQuizGenerateParams): Promise<GeneratedQuizResponse> {
    const res = await apiClient.post<ApiResponse<GeneratedQuizResponse>>('/api/v1/ai/quiz/generate', params, {
      timeout: 65000,
    });
    const payload = res.data as any;
    return payload.data ?? payload;
  },
};
