package com.acadevia.user.service;

import com.acadevia.user.dto.UserProfileDto;
import com.acadevia.user.dto.response.UserMeResponse;
import com.acadevia.user.dto.response.UserPreferencesResponse;
import com.acadevia.user.entity.Classroom;
import com.acadevia.user.entity.School;
import com.acadevia.user.entity.StudentClassroomMapping;
import com.acadevia.user.entity.UserProfile;
import com.acadevia.user.exception.ResourceNotFoundException;
import com.acadevia.user.mapper.UserProfileMapper;
import com.acadevia.user.repository.StudentClassroomMappingRepository;
import com.acadevia.user.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserProfileService {

    private final UserProfileRepository userProfileRepository;
    private final UserProfileMapper userProfileMapper;
    private final StudentClassroomMappingRepository studentClassroomMappingRepository;

    public UserProfileDto createOrUpdateProfile(Long userId, UserProfileDto profileDto) {
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElse(UserProfile.builder().userId(userId).build());

        userProfileMapper.updateEntityFromDto(profileDto, profile);

        UserProfile savedProfile = userProfileRepository.save(profile);
        return userProfileMapper.toDto(savedProfile);
    }

    @Transactional(readOnly = true)
    public UserProfileDto getProfileByUserId(Long userId) {
        return userProfileRepository.findByUserId(userId)
                .map(userProfileMapper::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("User profile not found for user ID: " + userId));
    }

    // ─── /me support methods ───

    @Transactional(readOnly = true)
    public UserMeResponse buildMeResponse(String userIdStr, String email, String role, String fullName) {
        UserMeResponse.UserMeResponseBuilder builder = UserMeResponse.builder()
                .id(userIdStr != null ? userIdStr : "0")
                .email(email != null ? email : "")
                .role(role != null ? role : "STUDENT")
                .languagePreference("en");

        if (userIdStr != null) {
            try {
                Long userId = Long.parseLong(userIdStr);

                // Try to get profile
                Optional<UserProfile> profileOpt = userProfileRepository.findByUserId(userId);
                if (profileOpt.isPresent()) {
                    UserProfile profile = profileOpt.get();
                    builder.avatarUrl(profile.getAvatarUrl());
                    builder.phone(profile.getPhone());
                    builder.phoneNumber(profile.getPhone());
                    builder.pinCode(profile.getPincode());
                    builder.pincode(profile.getPincode());
                    builder.joinedAt(profile.getCreatedAt() != null
                            ? profile.getCreatedAt().toString()
                            : LocalDateTime.now().toString());
                } else {
                    builder.joinedAt(LocalDateTime.now().toString());
                }

                // Try to get school info from student-classroom mapping
                String academicYear = String.valueOf(LocalDate.now().getYear());
                Optional<StudentClassroomMapping> mappingOpt =
                        studentClassroomMappingRepository.findByStudentIdAndAcademicYearAndIsActiveTrue(
                                userId, academicYear);

                if (mappingOpt.isPresent()) {
                    StudentClassroomMapping mapping = mappingOpt.get();
                    School school = mapping.getSchool();
                    Classroom classroom = mapping.getClassroom();

                    if (school != null) {
                        builder.schoolId(String.valueOf(school.getId()));
                        builder.schoolName(school.getName());
                        if (school.getCity() != null) {
                            builder.cityId(String.valueOf(school.getCity().getId()));
                            builder.cityName(school.getCity().getName());
                        }
                        if (school.getState() != null) {
                            builder.stateId(String.valueOf(school.getState().getId()));
                            builder.stateName(school.getState().getName());
                        }
                    }
                    if (classroom != null) {
                        builder.className("Class " + classroom.getClassGrade());
                        builder.section(classroom.getSection());
                    }
                }

            } catch (NumberFormatException e) {
                log.warn("Invalid userId header: {}", userIdStr);
            }
        }

        // fullName: prioritized from authenticated token header
        if (fullName != null && !fullName.isBlank()) {
            builder.fullName(fullName.trim());
        } else if (email != null && email.contains("@")) {
            builder.fullName(email.substring(0, email.indexOf('@')));
        } else {
            builder.fullName("Student");
        }

        return builder.build();
    }

    @Transactional(readOnly = true)
    public UserMeResponse buildMeResponse(String userIdStr, String email, String role) {
        return buildMeResponse(userIdStr, email, role, null);
    }

    public void applyMeUpdates(Long userId, Map<String, Object> updates) {
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElse(UserProfile.builder().userId(userId).build());

        if (updates.containsKey("bio")) {
            profile.setBio((String) updates.get("bio"));
        }
        if (updates.containsKey("address")) {
            profile.setAddress((String) updates.get("address"));
        }
        if (updates.containsKey("phone")) {
            profile.setPhone((String) updates.get("phone"));
        }
        if (updates.containsKey("phoneNumber")) {
            profile.setPhone((String) updates.get("phoneNumber"));
        }
        if (updates.containsKey("pincode")) {
            profile.setPincode((String) updates.get("pincode"));
        }
        if (updates.containsKey("pinCode")) {
            profile.setPincode((String) updates.get("pinCode"));
        }
        if (updates.containsKey("parentName")) {
            profile.setParentName((String) updates.get("parentName"));
        }
        if (updates.containsKey("parentPhone")) {
            profile.setParentPhone((String) updates.get("parentPhone"));
        }
        if (updates.containsKey("avatarUrl")) {
            profile.setAvatarUrl((String) updates.get("avatarUrl"));
        }

        userProfileRepository.save(profile);
    }

    @Transactional(readOnly = true)
    public UserPreferencesResponse getPreferences(String userIdStr) {
        // For now return defaults — can be extended to store preferences in DB
        if (userIdStr != null) {
            try {
                Long userId = Long.parseLong(userIdStr);
                Optional<UserProfile> profileOpt = userProfileRepository.findByUserId(userId);
                if (profileOpt.isPresent()) {
                    UserProfile profile = profileOpt.get();
                    UserPreferencesResponse.UserPreferencesResponseBuilder prefs =
                            UserPreferencesResponse.builder();

                    Map<String, Boolean> notifPrefs = profile.getNotificationPreferences();
                    if (notifPrefs != null) {
                        prefs.notificationEnabled(notifPrefs.getOrDefault("enabled", true));
                        prefs.soundEnabled(notifPrefs.getOrDefault("sound", true));
                    }
                    return prefs.build();
                }
            } catch (NumberFormatException e) {
                log.warn("Invalid userId for preferences: {}", userIdStr);
            }
        }
        return UserPreferencesResponse.builder().build();
    }

    public UserPreferencesResponse updatePreferences(String userIdStr, UserPreferencesResponse prefsUpdate) {
        // Store preferences update — for now just echo back
        log.info("Updating preferences for userId={}: {}", userIdStr, prefsUpdate);
        return prefsUpdate;
    }
}
