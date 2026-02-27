package com.acadevia.auth.service;

import com.acadevia.auth.dto.request.*;
import com.acadevia.auth.dto.response.*;

public interface AuthService {
    AuthResponse registerStudent(StudentRegistrationRequest request);
    AuthResponse registerTeacher(TeacherRegistrationRequest request);
    AuthResponse registerSchoolAdmin(SchoolAdminRegistrationRequest request);
    AuthResponse login(LoginRequest request, String deviceInfo, String ipAddress);
    TokenRefreshResponse refreshToken(RefreshTokenRequest request);
    MessageResponse logout(String refreshToken, Long userId);
    MessageResponse logoutAllDevices(Long userId);
    MessageResponse forgotPassword(ForgotPasswordRequest request);
    MessageResponse resetPassword(ResetPasswordRequest request);
    MessageResponse changePassword(ChangePasswordRequest request, Long userId);
    UserInfoResponse getCurrentUser(Long userId);
    MessageResponse verifyEmail(String token);
}
