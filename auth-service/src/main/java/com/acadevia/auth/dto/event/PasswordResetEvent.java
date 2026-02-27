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
public class PasswordResetEvent {
    private Long userId;
    private String email;
    private LocalDateTime requestedAt;
}
