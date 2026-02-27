package com.acadevia.notification.dto.kafka;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor @AllArgsConstructor
@Builder
public class StreakMilestoneEvent {
    private Long userId;
    private Integer streakDays;
    private Integer milestone;
    private Integer xpAwarded;
    private LocalDateTime timestamp;
}
