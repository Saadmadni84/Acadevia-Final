package com.acadevia.notification.service;

import com.acadevia.notification.dto.request.UpdatePreferenceRequest;
import com.acadevia.notification.dto.response.PreferenceResponse;
import com.acadevia.notification.enums.NotificationCategory;

import java.util.List;

public interface PreferenceService {
    List<PreferenceResponse> getUserPreferences(Long userId);
    
    PreferenceResponse  updatePreference(Long userId, UpdatePreferenceRequest request);
    
    boolean isChannelEnabled(Long userId, NotificationCategory category, String channel);
    
    void createDefaultPreferences(Long userId);
}
