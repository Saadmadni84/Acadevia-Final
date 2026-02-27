package com.acadevia.notification.dto.kafka;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor @AllArgsConstructor
@Builder
public class GameCompletedEvent {
    private Long userId;
    private Long gameId;
    private String gameTitle;
    private String subject;
    private Integer score;
    private Integer xpEarned;
    private Integer creditsEarned;
    private LocalDateTime timestamp;
}
