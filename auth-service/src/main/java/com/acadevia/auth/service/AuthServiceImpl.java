package com.acadevia.auth.service;

import com.acadevia.auth.dto.event.PasswordResetEvent;
import com.acadevia.auth.dto.event.UserLoggedInEvent;
import com.acadevia.auth.dto.event.UserRegisteredEvent;
import com.acadevia.auth.dto.request.*;
import com.acadevia.auth.dto.response.*;
import com.acadevia.auth.entity.PasswordResetToken;
import com.acadevia.auth.entity.RefreshToken;
import com.acadevia.auth.entity.User;
import com.acadevia.auth.entity.enums.Role;
import com.acadevia.auth.exception.*;
import com.acadevia.auth.repository.UserRepository;
import com.acadevia.auth.util.AppConstants;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final PasswordResetService passwordResetService;
    private final KafkaEventPublisher kafkaEventPublisher;

    @Override
    @Transactional
    public AuthResponse registerStudent(StudentRegistrationRequest request) {
        validatePasswordMatch(request.getPassword(), request.getConfirmPassword());
        checkIfEmailExists(request.getEmail());

        if (userRepository.existsByStudentSchoolIdAndSchoolId(request.getStudentSchoolId(), request.getSchoolId())) {
            throw new UserAlreadyExistsException("Student ID " + request.getStudentSchoolId() + " already registered for this school");
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .firstNameLocal(request.getFirstNameLocal())
                .lastNameLocal(request.getLastNameLocal())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(Role.STUDENT)
                .classGrade(request.getClassGrade())
                .schoolId(request.getSchoolId())
                .stateId(request.getStateId())
                .cityId(request.getCityId())
                .studentSchoolId(request.getStudentSchoolId())
                .preferredLanguage(request.getPreferredLanguage())
                .board(request.getBoard())
                .medium(request.getMedium())
                .isActive(true)
                .build();

        User savedUser = userRepository.save(user);

        return generateAuthResponse(savedUser, null, null, true);
    }

    @Override
    @Transactional
    public AuthResponse registerTeacher(TeacherRegistrationRequest request) {
        validatePasswordMatch(request.getPassword(), request.getConfirmPassword());
        checkIfEmailExists(request.getEmail());

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(Role.TEACHER)
                .schoolId(request.getSchoolId())
                .stateId(request.getStateId())
                .cityId(request.getCityId())
                .preferredLanguage(request.getPreferredLanguage())
                .isActive(true)
                .build();

        User savedUser = userRepository.save(user);

        return generateAuthResponse(savedUser, null, null, true);
    }

    @Override
    @Transactional
    public AuthResponse registerSchoolAdmin(SchoolAdminRegistrationRequest request) {
        validatePasswordMatch(request.getPassword(), request.getConfirmPassword());
        checkIfEmailExists(request.getEmail());

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(Role.SCHOOL_ADMIN)
                .schoolId(request.getSchoolId())
                .stateId(request.getStateId())
                .cityId(request.getCityId())
                .preferredLanguage(request.getPreferredLanguage())
                .isActive(true)
                .build();

        User savedUser = userRepository.save(user);

        return generateAuthResponse(savedUser, null, null, true);
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request, String deviceInfo, String ipAddress) {
        String identifier = request.getEmail() != null ? request.getEmail().trim() : "";
        User user = userRepository.findByEmail(identifier)
                .or(() -> userRepository.findByStudentSchoolId(identifier))
                .or(() -> userRepository.findByEmail(identifier + "@demo.acadevia.com"))
                .or(() -> userRepository.findByEmail(identifier + "@acadevia.com"))
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        if (!user.getIsActive()) {
            throw new AccountNotVerifiedException("Account is disabled");
        }

        if (user.getLockedUntil() != null && user.getLockedUntil().isAfter(LocalDateTime.now())) {
            throw new AccountLockedException("Account locked until " + user.getLockedUntil());
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            handleFailedLogin(user);
        }

        // Reset failed login attempts on success
        if (user.getFailedLoginAttempts() > 0) {
            userRepository.resetFailedLoginAttempts(user.getEmail());
        }
        userRepository.updateLastLogin(user.getId(), LocalDateTime.now());

        // Publish Login Event
        UserLoggedInEvent loginEvent = UserLoggedInEvent.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole().name())
                .deviceInfo(deviceInfo)
                .ipAddress(ipAddress)
                .loginTime(LocalDateTime.now())
                .build();
        kafkaEventPublisher.publishUserLoggedIn(loginEvent);

        return generateAuthResponse(user, deviceInfo, ipAddress, false);
    }

    @Override
    @Transactional
    public TokenRefreshResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenService.verifyRefreshToken(request.getRefreshToken());
        User user = refreshToken.getUser();

        // Rotate Refresh Token
        refreshTokenService.revokeToken(request.getRefreshToken());
        String newAccessToken = jwtService.generateAccessToken(user);
        RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(user.getId(), refreshToken.getDeviceInfo(), refreshToken.getIpAddress());

        return TokenRefreshResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken.getToken())
                .accessTokenExpiry(System.currentTimeMillis() + 900000) // 15 mins approx
                .build();
    }

    @Override
    @Transactional
    public MessageResponse logout(String refreshToken, Long userId) {
        refreshTokenService.revokeToken(refreshToken);
        return MessageResponse.builder()
                .message("Logged out successfully")
                .success(true)
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Override
    @Transactional
    public MessageResponse logoutAllDevices(Long userId) {
        refreshTokenService.revokeAllUserTokens(userId);
        return MessageResponse.builder()
                .message("Logged out from all devices")
                .success(true)
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Override
    @Transactional
    public MessageResponse forgotPassword(ForgotPasswordRequest request) {
        userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
            PasswordResetToken token = passwordResetService.createResetToken(user);
            
            PasswordResetEvent event = PasswordResetEvent.builder()
                    .userId(user.getId())
                    .email(user.getEmail())
                    .requestedAt(LocalDateTime.now())
                    .build();
            // In a real scenario, include the token link in the email data payload
            kafkaEventPublisher.publishPasswordReset(event);
        });
        
        // Always return success to prevent email enumeration
        return MessageResponse.builder()
                .message("If an account exists with that email, a password reset link has been sent.")
                .success(true)
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Override
    @Transactional
    public MessageResponse resetPassword(ResetPasswordRequest request) {
        validatePasswordMatch(request.getNewPassword(), request.getConfirmPassword());
        PasswordResetToken resetToken = passwordResetService.validateResetToken(request.getToken());
        User user = resetToken.getUser();

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        passwordResetService.markTokenAsUsed(resetToken);
        refreshTokenService.revokeAllUserTokens(user.getId()); // Force re-login

        return MessageResponse.builder()
                .message("Password reset successfully")
                .success(true)
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Override
    @Transactional
    public MessageResponse changePassword(ChangePasswordRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AuthException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Current password is incorrect");
        }

        validatePasswordMatch(request.getNewPassword(), request.getConfirmPassword());

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        refreshTokenService.revokeAllUserTokens(userId);

        return MessageResponse.builder()
                .message("Password changed successfully")
                .success(true)
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Override
    public UserInfoResponse getCurrentUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AuthException("User not found"));
        
        return UserInfoResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole().name())
                .phone(user.getPhone())
                .classGrade(user.getClassGrade())
                .schoolId(user.getSchoolId())
                .stateId(user.getStateId())
                .cityId(user.getCityId())
                .preferredLanguage(user.getPreferredLanguage())
                .totalXp(user.getTotalXp())
                .currentLevel(user.getCurrentLevel())
                .currentStreak(user.getCurrentStreak())
                .avatarUrl(user.getAvatarUrl())
                .isActive(user.getIsActive())
                .isEmailVerified(user.getIsEmailVerified())
                .lastLoginAt(user.getLastLoginAt())
                .createdAt(user.getCreatedAt())
                .build();
    }

    @Override
    public MessageResponse verifyEmail(String token) {
        // Implementation for email verification would go here
        // Usually involves TokenService for checking verification token
        return MessageResponse.builder()
                .message("Email verification not implemented yet")
                .success(true)
                .timestamp(LocalDateTime.now())
                .build();
    }

    // Helper Methods

    private void validatePasswordMatch(String password, String confirmPassword) {
        if (!password.equals(confirmPassword)) {
            throw new MethodArgumentNotValidException("Passwords do not match");
        }
    }

    private void checkIfEmailExists(String email) {
        if (userRepository.existsByEmail(email)) {
            throw new UserAlreadyExistsException("Email already registered");
        }
    }

    private void handleFailedLogin(User user) {
        userRepository.incrementFailedLoginAttempts(user.getEmail());
        int attempts = user.getFailedLoginAttempts() + 1;
        
        if (attempts >= AppConstants.MAX_LOGIN_ATTEMPTS) {
            userRepository.lockAccount(user.getEmail(), LocalDateTime.now().plusMinutes(AppConstants.ACCOUNT_LOCK_DURATION_MINUTES));
            throw new AccountLockedException("Account locked due to too many failed attempts");
        }
        
        throw new InvalidCredentialsException("Invalid credentials. " + (AppConstants.MAX_LOGIN_ATTEMPTS - attempts) + " attempts remaining.");
    }

    private AuthResponse generateAuthResponse(User user, String deviceInfo, String ipAddress, boolean isRegistration) {
        String accessToken = jwtService.generateAccessToken(user);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId(), deviceInfo, ipAddress);

        if (isRegistration) {
            UserRegisteredEvent event = UserRegisteredEvent.builder()
                    .userId(user.getId())
                    .email(user.getEmail())
                    .role(user.getRole().name())
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .classGrade(user.getClassGrade())
                    .schoolId(user.getSchoolId())
                    .stateId(user.getStateId())
                    .cityId(user.getCityId())
                    .preferredLanguage(user.getPreferredLanguage())
                    .studentSchoolId(user.getStudentSchoolId())
                    .registeredAt(LocalDateTime.now())
                    .build();
            kafkaEventPublisher.publishUserRegistered(event);
        }

        return AuthResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole().name())
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .accessTokenExpiry(System.currentTimeMillis() + 900000)
                .refreshTokenExpiry(java.sql.Timestamp.valueOf(refreshToken.getExpiresAt()).getTime())
                .preferredLanguage(user.getPreferredLanguage())
                .classGrade(user.getClassGrade())
                .schoolId(user.getSchoolId())
                .message(isRegistration ? "Registration successful" : "Login successful")
                .build();
    }

    // Custom runtime exception to avoid checked exception in private helper
    private static class MethodArgumentNotValidException extends RuntimeException {
        public MethodArgumentNotValidException(String message) {
            super(message);
        }
    }
}
