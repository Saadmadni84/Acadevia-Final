package com.acadevia.admin.service;

import com.acadevia.admin.dto.kafka.AnnouncementBroadcastEvent;
import com.acadevia.admin.dto.request.AnnouncementRequest;
import com.acadevia.admin.dto.request.FeatureFlagRequest;
import com.acadevia.admin.dto.response.AnnouncementResponse;
import com.acadevia.admin.dto.response.FeatureFlagResponse;
import com.acadevia.admin.entity.FeatureFlag;
import com.acadevia.admin.entity.PlatformSetting;
import com.acadevia.admin.entity.SystemAnnouncement;
import com.acadevia.admin.enums.AuditAction;
import com.acadevia.admin.enums.SettingCategory;
import com.acadevia.admin.kafka.producer.AdminEventProducer;
import com.acadevia.admin.repository.FeatureFlagRepository;
import com.acadevia.admin.repository.PlatformSettingRepository;
import com.acadevia.admin.repository.SystemAnnouncementRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PlatformSettingsServiceImpl implements PlatformSettingsService {

    private final FeatureFlagRepository flagRepo;
    private final PlatformSettingRepository settingRepo;
    private final SystemAnnouncementRepository announcementRepo;
    private final AuditService auditService;
    private final AdminEventProducer eventProducer;

    // === FEATURE FLAGS ===

    @Override
    @Cacheable(value = "featureFlags", key = "'all'")
    public List<FeatureFlagResponse> getAllFlags() {
        return flagRepo.findAll().stream().map(this::toFlagResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    @CacheEvict(value = "featureFlags", allEntries = true)
    public FeatureFlagResponse toggleFlag(String flagKey, Boolean isEnabled, Long adminUserId) {
        FeatureFlag flag = flagRepo.findByFlagKey(flagKey)
                .orElseThrow(() -> new RuntimeException("Feature flag not found: " + flagKey));

        Boolean oldValue = flag.getIsEnabled();
        flag.setIsEnabled(isEnabled);
        flag.setUpdatedBy(adminUserId);
        flag = flagRepo.save(flag);

        auditService.log(adminUserId, null, AuditAction.FEATURE_FLAG_TOGGLED,
                "FEATURE_FLAG", flag.getId(),
                flagKey + ": " + oldValue + " → " + isEnabled,
                null, null, null, null);

        log.info("Feature flag toggled: {} = {} (by admin: {})", flagKey, isEnabled, adminUserId);
        return toFlagResponse(flag);
    }

    @Override
    @Transactional
    @CacheEvict(value = "featureFlags", allEntries = true)
    public FeatureFlagResponse createFlag(FeatureFlagRequest request, Long adminUserId) {
        FeatureFlag flag = FeatureFlag.builder()
                .flagKey(request.getFlagKey())
                .displayName(request.getDisplayName())
                .description(request.getDescription())
                .isEnabled(request.getIsEnabled() != null ? request.getIsEnabled() : true)
                .scope(request.getScope())
                .updatedBy(adminUserId)
                .build();

        flag = flagRepo.save(flag);
        log.info("Feature flag created: {} (by admin: {})", request.getFlagKey(), adminUserId);
        return toFlagResponse(flag);
    }

    @Override
    public boolean isFlagEnabled(String flagKey) {
        return flagRepo.findByFlagKey(flagKey)
                .map(FeatureFlag::getIsEnabled)
                .orElse(false);
    }

    // === SETTINGS ===

    @Override
    public Map<String, String> getAllSettings() {
        Map<String, String> settings = new HashMap<>();
        settingRepo.findAll().forEach(s -> settings.put(s.getSettingKey(), s.getSettingValue()));
        return settings;
    }

    @Override
    public String getSetting(String key) {
        return settingRepo.findBySettingKey(key)
                .map(PlatformSetting::getSettingValue)
                .orElse(null);
    }

    @Override
    @Transactional
    public void updateSetting(String key, String value, Long adminUserId) {
        PlatformSetting setting = settingRepo.findBySettingKey(key)
                .orElseGet(() -> PlatformSetting.builder()
                        .settingKey(key)
                        .category(SettingCategory.GENERAL)
                        .build());

        String oldValue = setting.getSettingValue();
        setting.setSettingValue(value);
        setting.setUpdatedBy(adminUserId);
        settingRepo.save(setting);

        auditService.log(adminUserId, null, AuditAction.SETTING_UPDATED,
                "PLATFORM_SETTING", setting.getId(),
                key + ": " + oldValue + " → " + value,
                null, null, null, null);
    }

    // === MAINTENANCE ===

    @Override
    public boolean isMaintenanceMode() {
        return "true".equals(getSetting("platform.maintenance.mode"));
    }

    @Override
    @Transactional
    public void setMaintenanceMode(boolean enabled, Long adminUserId) {
        updateSetting("platform.maintenance.mode", String.valueOf(enabled), adminUserId);

        auditService.log(adminUserId, null, AuditAction.MAINTENANCE_MODE_TOGGLED,
                "PLATFORM", null,
                "Maintenance mode: " + enabled,
                null, null, null, null);

        log.info("Maintenance mode set to: {} (by admin: {})", enabled, adminUserId);
    }

    // === ANNOUNCEMENTS ===

    @Override
    @Transactional
    public AnnouncementResponse createAnnouncement(AnnouncementRequest request, Long adminUserId) {
        SystemAnnouncement ann = SystemAnnouncement.builder()
                .title(request.getTitle())
                .message(request.getMessage())
                .severity(request.getSeverity() != null ? request.getSeverity() : "INFO")
                .targetAudience(request.getTargetAudience() != null ? request.getTargetAudience() : "ALL")
                .isPinned(request.getIsPinned() != null ? request.getIsPinned() : false)
                .expiresAt(request.getExpiresAt())
                .createdBy(adminUserId)
                .build();

        ann = announcementRepo.save(ann);

        auditService.log(adminUserId, null, AuditAction.ANNOUNCEMENT_CREATED,
                "ANNOUNCEMENT", ann.getId(), "Created: " + request.getTitle(),
                null, null, null, null);

        eventProducer.publishAnnouncement(AnnouncementBroadcastEvent.builder()
                .announcementId(ann.getId())
                .title(ann.getTitle())
                .message(ann.getMessage())
                .severity(ann.getSeverity())
                .targetAudience(ann.getTargetAudience())
                .timestamp(LocalDateTime.now())
                .build());

        return toAnnouncementResponse(ann);
    }

    @Override
    public List<AnnouncementResponse> getActiveAnnouncements() {
        return announcementRepo.findActiveAnnouncements(LocalDateTime.now())
                .stream().map(this::toAnnouncementResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteAnnouncement(Long announcementId, Long adminUserId) {
        announcementRepo.deleteById(announcementId);
        auditService.log(adminUserId, null, AuditAction.ANNOUNCEMENT_DELETED,
                "ANNOUNCEMENT", announcementId, "Deleted announcement",
                null, null, null, null);
    }

    // === MAPPERS ===

    private FeatureFlagResponse toFlagResponse(FeatureFlag f) {
        return FeatureFlagResponse.builder()
                .id(f.getId()).flagKey(f.getFlagKey()).displayName(f.getDisplayName())
                .description(f.getDescription()).isEnabled(f.getIsEnabled())
                .scope(f.getScope()).updatedAt(f.getUpdatedAt()).build();
    }

    private AnnouncementResponse toAnnouncementResponse(SystemAnnouncement a) {
        return AnnouncementResponse.builder()
                .id(a.getId()).title(a.getTitle()).message(a.getMessage())
                .severity(a.getSeverity()).targetAudience(a.getTargetAudience())
                .isActive(a.getIsActive()).isPinned(a.getIsPinned())
                .expiresAt(a.getExpiresAt()).createdAt(a.getCreatedAt()).build();
    }
}
