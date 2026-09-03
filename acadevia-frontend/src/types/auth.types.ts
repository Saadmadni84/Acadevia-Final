export interface LoginRequest { email: string; password: string; rememberMe?: boolean; }
export interface StudentRegistrationRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  phoneNumber?: string;
  classGrade: number;
  schoolId: number;
  stateId: number;
  cityId: number;
  pinCode?: string;
  pincode?: string;
  studentSchoolId: string;
  preferredLanguage?: string;
  board?: string;
  medium?: string;
}

export interface TeacherRegistrationRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  phoneNumber?: string;
  schoolId: number;
  stateId: number;
  cityId: number;
  pinCode?: string;
  pincode?: string;
  preferredLanguage?: string;
  subject?: string;
}

export type RegisterRequest = StudentRegistrationRequest | TeacherRegistrationRequest;
export interface AuthResponse { accessToken: string; refreshToken: string; user: AuthUser; }
export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  name?: string;
  role: string;
  avatarUrl?: string;
  schoolName?: string;
  className?: string;
  classGrade?: number;
  section?: string;
  cityName?: string;
  stateName?: string;
  pinCode?: string;
  pincode?: string;
  phone?: string;
  phoneNumber?: string;
  board?: string;
  joinedAt?: string;
  languagePreference: string;
  level?: number;
  xp?: number;
  streak?: number;
  longestStreak?: number;
  coursesCompleted?: number;
  quizzesTaken?: number;
  hoursLearned?: number;
}
export interface ForgotPasswordRequest { email: string; }
export interface OTPVerifyRequest { email: string; otp: string; }
export interface ResetPasswordRequest { email: string; otp: string; newPassword: string; }
