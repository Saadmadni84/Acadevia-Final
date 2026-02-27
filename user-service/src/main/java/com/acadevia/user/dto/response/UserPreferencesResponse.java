package com.acadevia.user.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPreferencesResponse {

    @Builder.Default
    private String languagePreference = "en";
    @Builder.Default
    private boolean notificationEnabled = true;
    @Builder.Default
    private String downloadQuality = "medium";
    @Builder.Default
    private boolean dataSaverMode = false;
    @Builder.Default
    private boolean darkMode = false;
    @Builder.Default
    private boolean soundEnabled = true;
    @Builder.Default
    private boolean autoSync = true;
    @Builder.Default
    private int dailyGoal = 30;
}
