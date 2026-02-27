package com.acadevia.user.dto;

import com.acadevia.user.entity.UserProfile;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDto {

    private Long id;
    private Long userId;
    private String bio;
    private LocalDate dateOfBirth;
    private UserProfile.Gender gender;
    private String address;
    private String pincode;
    private String parentName;
    private String parentPhone;
    private String parentEmail;
    private String emergencyContact;
    private String bloodGroup;
    private List<String> interests;
    private List<String> achievements;
    private Map<String, String> socialLinks;
    private Map<String, Boolean> notificationPreferences;
    private Map<String, Boolean> privacySettings;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
