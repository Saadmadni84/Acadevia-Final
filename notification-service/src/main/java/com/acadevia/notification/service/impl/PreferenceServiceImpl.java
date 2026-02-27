package com.acadevia.notification.service.impl;

import com.acadevia.notification.dto.request.UpdatePreferenceRequest;
import com.acadevia.notification.dto.response.PreferenceResponse;
import com.acadevia.notification.entity.NotificationPreference;
import com.acadevia.notification.enums.NotificationCategory;
import com.acadevia.notification.repository.NotificationPreferenceRepository;
import com.acadevia.notification.service.PreferenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class PreferenceServiceImpl implements PreferenceService {

    private final NotificationPreferenceRepository preferenceRepository;

    @Override
    public List<PreferenceResponse> getUserPreferences(Long userId) {
        List<NotificationPreference> preferences = preferenceRepository.findByUserId(userId);
        if (preferences.isEmpty()) {
            createDefaultPreferences(userId);
            preferences = preferenceRepository.findByUserId(userId);
        }
        return preferences.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    @CacheEvict(value = "preferences", key = "#userId + '-' + #request.category")
    public PreferenceResponse updatePreference(Long userId, UpdatePreferenceRequest request) {
        NotificationPreference preference = preferenceRepository.findByUserIdAndCategory(userId, request.getCategory())
                .orElseGet(() -> NotificationPreference.builder()
                        .userId(userId)
                        .category(request.getCategory())
                        .build());

        preference.setEmailEnabled(request.isEmailEnabled());
        preference.setSmsEnabled(request.isSmsEnabled());
        preference.setPushEnabled(request.isPushEnabled());
        preference.setUpdatedAt(LocalDateTime.now());

        return mapToResponse(preferenceRepository.save(preference));
    }

    @Override
    @Cacheable(value = "preferences", key = "#userId + '-' + #category")
    public boolean isChannelEnabled(Long userId, NotificationCategory category, String channel) {
        return preferenceRepository.findByUserIdAndCategory(userId, category)
                .map(pref -> switch (channel.toLowerCase()) {
                    case "email" -> pref.isEmailEnabled();
                    case "sms" -> pref.isSmsEnabled();
                    case "push" -> pref.isPushEnabled();
                    default -> false;
                })
                .orElse(true); // Default to true if no preference set
    }

    @Override
    @Transactional
    public void createDefaultPreferences(Long userId) {
        for (NotificationCategory category : NotificationCategory.values()) {
            if (!preferenceRepository.existsByUserIdAndCategory(userId, category)) {
                NotificationPreference pref = NotificationPreference.builder()
                        .userId(userId)
                        .category(category)
                        .emailEnabled(true)
                        .smsEnabled(false) 
                        .pushEnabled(true)
                        .inAppEnabled(true)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build();
                preferenceRepository.save(pref);
            }
        }
    }

    private PreferenceResponse mapToResponse(NotificationPreference p) {
        return PreferenceResponse.builder()
                .id(p.getId())
                .userId(p.getUserId())
                .category(p.getCategory())
                .emailEnabled(p.isEmailEnabled())
                .smsEnabled(p.isSmsEnabled())
                .pushEnabled(p.isPushEnabled())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}
