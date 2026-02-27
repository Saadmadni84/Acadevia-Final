export interface LoginRequest { email: string; password: string; rememberMe?: boolean; }
export interface StudentRegistrationRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  classGrade: number;
  schoolId: number;
  stateId: number;
  cityId: number;
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
  schoolId: number;
  stateId: number;
  cityId: number;
  preferredLanguage?: string;
  subject?: string;
}

export type RegisterRequest = StudentRegistrationRequest | TeacherRegistrationRequest;
export interface AuthResponse { accessToken: string; refreshToken: string; user: AuthUser; }
export interface AuthUser { id: string; email: string; fullName: string; role: string; avatarUrl?: string; schoolName?: string; className?: string; languagePreference: string; }
export interface ForgotPasswordRequest { email: string; }
export interface OTPVerifyRequest { email: string; otp: string; }
export interface ResetPasswordRequest { email: string; otp: string; newPassword: string; }
