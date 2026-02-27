package com.acadevia.admin.service;

import com.acadevia.admin.dto.request.AnnouncementRequest;
import com.acadevia.admin.dto.request.FeatureFlagRequest;
import com.acadevia.admin.dto.response.AnnouncementResponse;
import com.acadevia.admin.dto.response.FeatureFlagResponse;

import java.util.List;
import java.util.Map;

public interface PlatformSettingsService {
    // Feature Flags
    List<FeatureFlagResponse> getAllFlags();
    FeatureFlagResponse toggleFlag(String flagKey, Boolean isEnabled, Long adminUserId);
    FeatureFlagResponse createFlag(FeatureFlagRequest request, Long adminUserId);
    boolean isFlagEnabled(String flagKey);

    // Settings
    Map<String, String> getAllSettings();
    String getSetting(String key);
    void updateSetting(String key, String value, Long adminUserId);

    // Maintenance
    boolean isMaintenanceMode();
    void setMaintenanceMode(boolean enabled, Long adminUserId);

    // Announcements
    AnnouncementResponse createAnnouncement(AnnouncementRequest request, Long adminUserId);
    List<AnnouncementResponse> getActiveAnnouncements();
    void deleteAnnouncement(Long announcementId, Long adminUserId);
}
