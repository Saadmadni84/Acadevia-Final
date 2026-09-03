package com.acadevia.auth.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private Long userId;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
    private String accessToken;
    private String refreshToken;
    private Long accessTokenExpiry;
    private Long refreshTokenExpiry;
    private String preferredLanguage;
    private Integer classGrade;
    private Long schoolId;
    private String schoolName;
    private String stateName;
    private String cityName;
    private String pinCode;
    private String phone;
    private String message;
}
