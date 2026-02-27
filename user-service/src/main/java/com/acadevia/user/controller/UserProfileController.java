package com.acadevia.user.controller;

import com.acadevia.user.dto.UserProfileDto;
import com.acadevia.user.dto.response.ApiResponse;
import com.acadevia.user.dto.response.UserMeResponse;
import com.acadevia.user.dto.response.UserPreferencesResponse;
import com.acadevia.user.service.UserProfileService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Slf4j
public class UserProfileController {

    private final UserProfileService userProfileService;

    // ─── /me endpoints (authenticated user via gateway headers) ───

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserMeResponse>> getMe(HttpServletRequest request) {
        String userId = request.getHeader("X-User-Id");
        String email = request.getHeader("X-User-Email");
        String role = request.getHeader("X-User-Role");
        log.info("GET /me for userId={}, email={}, role={}", userId, email, role);
        UserMeResponse response = userProfileService.buildMeResponse(userId, email, role);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserMeResponse>> updateMe(
            HttpServletRequest request,
            @RequestBody Map<String, Object> updates) {
        String userId = request.getHeader("X-User-Id");
        String email = request.getHeader("X-User-Email");
        String role = request.getHeader("X-User-Role");
        log.info("PUT /me for userId={}", userId);
        // Apply updates to profile if they exist
        if (userId != null) {
            userProfileService.applyMeUpdates(Long.parseLong(userId), updates);
        }
        UserMeResponse response = userProfileService.buildMeResponse(userId, email, role);
        return ResponseEntity.ok(ApiResponse.ok(response, "Profile updated successfully"));
    }

    @GetMapping("/me/preferences")
    public ResponseEntity<ApiResponse<UserPreferencesResponse>> getPreferences(HttpServletRequest request) {
        String userId = request.getHeader("X-User-Id");
        log.info("GET /me/preferences for userId={}", userId);
        UserPreferencesResponse prefs = userProfileService.getPreferences(userId);
        return ResponseEntity.ok(ApiResponse.ok(prefs));
    }

    @PutMapping("/me/preferences")
    public ResponseEntity<ApiResponse<UserPreferencesResponse>> updatePreferences(
            HttpServletRequest request,
            @RequestBody UserPreferencesResponse prefsUpdate) {
        String userId = request.getHeader("X-User-Id");
        log.info("PUT /me/preferences for userId={}", userId);
        UserPreferencesResponse prefs = userProfileService.updatePreferences(userId, prefsUpdate);
        return ResponseEntity.ok(ApiResponse.ok(prefs, "Preferences updated successfully"));
    }

    @PostMapping("/me/avatar")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadAvatar(HttpServletRequest request) {
        // Avatar upload placeholder — return a default avatar URL
        String userId = request.getHeader("X-User-Id");
        log.info("POST /me/avatar for userId={}", userId);
        Map<String, String> result = Map.of("avatarUrl", "/assets/avatars/default.png");
        return ResponseEntity.ok(ApiResponse.ok(result, "Avatar updated"));
    }

    // ─── Existing profile endpoints ───

    @GetMapping("/{userId}/profile")
    public ResponseEntity<UserProfileDto> getUserProfile(@PathVariable Long userId) {
        return ResponseEntity.ok(userProfileService.getProfileByUserId(userId));
    }

    @PostMapping("/{userId}/profile")
    public ResponseEntity<UserProfileDto> createOrUpdateProfile(
            @PathVariable Long userId,
            @Valid @RequestBody UserProfileDto profileDto) {
        return ResponseEntity.ok(userProfileService.createOrUpdateProfile(userId, profileDto));
    }
}
