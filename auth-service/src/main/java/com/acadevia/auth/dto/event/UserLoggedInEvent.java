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
public class UserLoggedInEvent {
    private Long userId;
    private String email;
    private String role;
    private String deviceInfo;
    private String ipAddress;
    private LocalDateTime loginTime;
}
