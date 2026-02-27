package com.acadevia.notification.controller;

import com.acadevia.notification.dto.request.UpdatePreferenceRequest;
import com.acadevia.notification.dto.response.PreferenceResponse;
import com.acadevia.notification.service.PreferenceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/preferences")
@RequiredArgsConstructor
@Tag(name = "Notification Preferences", description = "Manage user notification settings")
public class PreferenceController {

    private final PreferenceService preferenceService;

    @GetMapping("/{userId}")
    @Operation(summary = "Get user preferences")
    public ResponseEntity<List<PreferenceResponse>> getUserPreferences(@PathVariable Long userId) {
        return ResponseEntity.ok(preferenceService.getUserPreferences(userId));
    }

    @PutMapping("/{userId}")
    @Operation(summary = "Update preference for a category")
    public ResponseEntity<PreferenceResponse> updatePreference(
            @PathVariable Long userId,
            @RequestBody UpdatePreferenceRequest request) {
        return ResponseEntity.ok(preferenceService.updatePreference(userId, request));
    }

    @PostMapping("/{userId}/init")
    @Operation(summary = "Initialize default preferences for user")
    public ResponseEntity<Void> initPreferences(@PathVariable Long userId) {
        preferenceService.createDefaultPreferences(userId);
        return ResponseEntity.ok().build();
    }
}
