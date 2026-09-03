package com.acadevia.auth.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserInfoResponse {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
    private String phone;
    private Integer classGrade;
    private Long schoolId;
    private Long stateId;
    private Long cityId;
    private String pinCode;
    private String schoolName;
    private String stateName;
    private String cityName;
    private String preferredLanguage;
    private Long totalXp;
    private Integer currentLevel;
    private Integer currentStreak;
    private String avatarUrl;
    private Boolean isActive;
    private Boolean isEmailVerified;
    private LocalDateTime lastLoginAt;
    private LocalDateTime createdAt;
}
