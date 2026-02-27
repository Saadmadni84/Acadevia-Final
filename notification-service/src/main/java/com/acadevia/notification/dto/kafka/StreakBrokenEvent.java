package com.acadevia.notification.dto.kafka;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor @AllArgsConstructor
@Builder
public class StreakBrokenEvent {
    private Long userId;
    private Integer previousStreak;
    private String reason;
    private LocalDateTime timestamp;
}
