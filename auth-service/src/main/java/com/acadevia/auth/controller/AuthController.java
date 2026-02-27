package com.acadevia.auth.controller;

import com.acadevia.auth.dto.request.*;
import com.acadevia.auth.dto.response.*;
import com.acadevia.auth.service.AuthService;
import com.acadevia.auth.util.AppConstants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "AUTH Management APIs")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register/student")
    @Operation(summary = "Register a new student")
    public ResponseEntity<AuthResponse> registerStudent(@Valid @RequestBody StudentRegistrationRequest request) {
        return new ResponseEntity<>(authService.registerStudent(request), HttpStatus.CREATED);
    }

    @PostMapping("/register/teacher")
    @Operation(summary = "Register a new teacher")
    public ResponseEntity<AuthResponse> registerTeacher(@Valid @RequestBody TeacherRegistrationRequest request) {
        return new ResponseEntity<>(authService.registerTeacher(request), HttpStatus.CREATED);
    }

    @PostMapping("/register/school-admin")
    @Operation(summary = "Register a new school admin")
    public ResponseEntity<AuthResponse> registerSchoolAdmin(@Valid @RequestBody SchoolAdminRegistrationRequest request) {
        return new ResponseEntity<>(authService.registerSchoolAdmin(request), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    @Operation(summary = "User login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request, HttpServletRequest servletRequest) {
        String deviceInfo = servletRequest.getHeader("User-Agent");
        String ipAddress = servletRequest.getHeader("X-Forwarded-For");
        if (ipAddress == null) {
            ipAddress = servletRequest.getRemoteAddr();
        }
        return new ResponseEntity<>(authService.login(request, deviceInfo, ipAddress), HttpStatus.OK);
    }

    @PostMapping("/refresh-token")
    @Operation(summary = "Refresh access token")
    public ResponseEntity<TokenRefreshResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        return new ResponseEntity<>(authService.refreshToken(request), HttpStatus.OK);
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout current device")
    public ResponseEntity<MessageResponse> logout(@Valid @RequestBody RefreshTokenRequest request, 
                                                  @RequestHeader(value = AppConstants.HEADER_USER_ID, required = false) Long userId) {
        return new ResponseEntity<>(authService.logout(request.getRefreshToken(), userId), HttpStatus.OK);
    }

    @PostMapping("/logout-all")
    @Operation(summary = "Logout all devices")
    public ResponseEntity<MessageResponse> logoutAll(@RequestHeader(AppConstants.HEADER_USER_ID) Long userId) {
        return new ResponseEntity<>(authService.logoutAllDevices(userId), HttpStatus.OK);
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Request password reset")
    public ResponseEntity<MessageResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return new ResponseEntity<>(authService.forgotPassword(request), HttpStatus.OK);
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password with token")
    public ResponseEntity<MessageResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return new ResponseEntity<>(authService.resetPassword(request), HttpStatus.OK);
    }

    @PutMapping("/change-password")
    @Operation(summary = "Change password")
    public ResponseEntity<MessageResponse> changePassword(@Valid @RequestBody ChangePasswordRequest request,
                                                          @RequestHeader(AppConstants.HEADER_USER_ID) Long userId) {
        return new ResponseEntity<>(authService.changePassword(request, userId), HttpStatus.OK);
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user info")
    public ResponseEntity<UserInfoResponse> getCurrentUser(@RequestHeader(AppConstants.HEADER_USER_ID) Long userId) {
        return new ResponseEntity<>(authService.getCurrentUser(userId), HttpStatus.OK);
    }

    @GetMapping("/verify-email")
    @Operation(summary = "Verify email address")
    public ResponseEntity<MessageResponse> verifyEmail(@RequestParam String token) {
        return new ResponseEntity<>(authService.verifyEmail(token), HttpStatus.OK);
    }
}
