package com.acadevia.admin.controller;

import com.acadevia.admin.dto.request.AnnouncementRequest;
import com.acadevia.admin.dto.request.FeatureFlagRequest;
import com.acadevia.admin.dto.response.AnnouncementResponse;
import com.acadevia.admin.dto.response.FeatureFlagResponse;
import com.acadevia.admin.service.PlatformSettingsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/platform")
@RequiredArgsConstructor
@Tag(name = "Platform Settings", description = "Manage feature flags and announcements")
@PreAuthorize("hasRole('ADMIN')")
public class PlatformSettingsController {

    private final PlatformSettingsService settingsService;

    // === Feature Flags ===

    @GetMapping("/flags")
    public ResponseEntity<List<FeatureFlagResponse>> getAllFlags() {
        return ResponseEntity.ok(settingsService.getAllFlags());
    }

    @PostMapping("/flags")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<FeatureFlagResponse> createFlag(
            @RequestBody FeatureFlagRequest request,
            @RequestHeader(name = "X-Admin-ID", required = false, defaultValue = "1") Long adminId) {
        return ResponseEntity.ok(settingsService.createFlag(request, adminId));
    }

    @PatchMapping("/flags/{key}/toggle")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<FeatureFlagResponse> toggleFlag(
            @PathVariable String key,
            @RequestParam Boolean enabled,
            @RequestHeader(name = "X-Admin-ID", required = false, defaultValue = "1") Long adminId) {
        return ResponseEntity.ok(settingsService.toggleFlag(key, enabled, adminId));
    }

    // === Announcements ===

    @PostMapping("/announcements")
    public ResponseEntity<AnnouncementResponse> createAnnouncement(
            @RequestBody AnnouncementRequest request,
            @RequestHeader(name = "X-Admin-ID", required = false, defaultValue = "1") Long adminId) {
        return ResponseEntity.ok(settingsService.createAnnouncement(request, adminId));
    }

    @GetMapping("/announcements/active")
    public ResponseEntity<List<AnnouncementResponse>> getActiveAnnouncements() {
        return ResponseEntity.ok(settingsService.getActiveAnnouncements());
    }

    @DeleteMapping("/announcements/{id}")
    public ResponseEntity<Void> deleteAnnouncement(
            @PathVariable Long id,
            @RequestHeader(name = "X-Admin-ID", required = false, defaultValue = "1") Long adminId) {
        settingsService.deleteAnnouncement(id, adminId);
        return ResponseEntity.noContent().build();
    }

    // === Settings ===

    @GetMapping("/settings")
    public ResponseEntity<Map<String, String>> getAllSettings() {
        return ResponseEntity.ok(settingsService.getAllSettings());
    }

    @PostMapping("/maintenance")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> setMaintenanceMode(
            @RequestParam boolean enabled,
            @RequestHeader(name = "X-Admin-ID", required = false, defaultValue = "1") Long adminId) {
        settingsService.setMaintenanceMode(enabled, adminId);
        return ResponseEntity.ok().build();
    }
}
