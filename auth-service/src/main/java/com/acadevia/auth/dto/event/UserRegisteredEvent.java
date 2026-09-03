package com.acadevia.auth.dto.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserRegisteredEvent {
    private Long userId;
    private String email;
    private String role;
    private String phone;
    private String firstName;
    private String lastName;
    private Integer classGrade;
    private Long schoolId;
    private Long stateId;
    private Long cityId;
    private String pinCode;
    private String preferredLanguage;
    private String studentSchoolId;
    private LocalDateTime registeredAt;
}
