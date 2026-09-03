import apiClient from './api.client';
import { dataService } from './data.service';
import type {
  LoginRequest,
  AuthResponse,
  ForgotPasswordRequest,
  OTPVerifyRequest,
  ResetPasswordRequest,
} from '@/types/auth.types';
import type { ApiResponse } from '@/types/common.types';

export const authService = {
  login: (data: LoginRequest) =>
    apiClient.post<ApiResponse<AuthResponse>>('/api/v1/auth/login', data),

  register: (data: Record<string, any>) => {
    const role = (data.role || 'STUDENT').toUpperCase();
    const nameParts = (data.name || '').trim().split(/\s+/);
    const firstName = nameParts[0] || 'User';
    const lastName =
      nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'User';

    const base = {
      firstName,
      lastName,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword || data.password,
      phone: data.phone || '',
      schoolId: 1,
      stateId: 1,
      cityId: 1,
      preferredLanguage: data.preferredLanguage || 'en',
    };

    const schoolName = data.schoolName || '';
    const stateName = data.state || '';
    const cityName = data.city || '';
    const pinCode = (data.pinCode || data.pincode || '').trim();
    const classGrade = parseInt(data.grade) || 10;

    const registeredUser = {
      id: `user-${Date.now()}`,
      email: data.email,
      fullName: (data.name || `${firstName} ${lastName}`).trim(),
      role: role as 'STUDENT' | 'TEACHER',

      schoolName,
      stateName,
      cityName,

      // PIN Code
      pinCode,
      pincode: pinCode,

      // Phone
      phone: (data.phone || data.phoneNumber || '').trim(),
      phoneNumber: (data.phone || data.phoneNumber || '').trim(),

      classGrade: role === 'STUDENT' ? classGrade : undefined,
      joinDate: 'Just now',
      totalXP: 0,
      currentLevel: 1,
      currentStreak: 0,
      lessonsCompleted: 0,
    };

    if (role === 'TEACHER') {
      return apiClient
        .post<ApiResponse<AuthResponse>>('/api/v1/auth/register/teacher', {
          ...base,
          subject: data.subject || '',

          // PIN Code sent to backend
          pinCode,
          pincode: pinCode,
        })
        .then((res) => {
          dataService.upsertUser(registeredUser as any);
          return res;
        })
        .catch((err) => {
          dataService.upsertUser(registeredUser as any);
          throw err;
        });
    }

    return apiClient
      .post<ApiResponse<AuthResponse>>('/api/v1/auth/register/student', {
        ...base,
        classGrade: parseInt(data.grade) || 1,
        studentSchoolId:
          data.studentSchoolId || `STU-${Date.now()}`,
        board: data.board || '',
        medium: data.medium || '',

        // PIN Code sent to backend
        pinCode,
        pincode: pinCode,
      })
      .then((res) => {
        dataService.upsertUser(registeredUser as any);
        return res;
      })
      .catch((err) => {
        dataService.upsertUser(registeredUser as any);
        throw err;
      });
  },

  refreshToken: (refreshToken: string) =>
    apiClient.post<ApiResponse<AuthResponse>>(
      '/api/v1/auth/refresh-token',
      { refreshToken }
    ),

  forgotPassword: (data: ForgotPasswordRequest) =>
    apiClient.post<ApiResponse<{ message: string }>>(
      '/api/v1/auth/forgot-password',
      data
    ),

  verifyOTP: (data: OTPVerifyRequest) =>
    apiClient.post<ApiResponse<{ valid: boolean }>>(
      '/api/v1/auth/verify-otp',
      data
    ),

  resetPassword: (data: ResetPasswordRequest) =>
    apiClient.post<ApiResponse<{ message: string }>>(
      '/api/v1/auth/reset-password',
      data
    ),

  logout: () => apiClient.post('/api/v1/auth/logout'),
};