package com.acadevia.user.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserMeResponse {

    private String id;
    private String email;
    private String fullName;
    private String role;
    private String avatarUrl;
    private String phone;
    private String phoneNumber;

    // School & location
    private String schoolId;
    private String schoolName;
    private String stateId;
    private String stateName;
    private String cityId;
    private String cityName;
    private String pinCode;
    private String pincode;

    // Class info
    private String className;
    private String section;

    // Preferences
    @Builder.Default
    private String languagePreference = "en";

    // Gamification (defaults — populated by gamification-service in future)
    @Builder.Default
    private int xp = 0;
    @Builder.Default
    private int level = 1;
    @Builder.Default
    private int streak = 0;

    // Stats (defaults — populated by analytics-service in future)
    @Builder.Default
    private int coursesCompleted = 0;
    @Builder.Default
    private int quizzesTaken = 0;
    @Builder.Default
    private double hoursLearned = 0.0;

    private String joinedAt;
}
