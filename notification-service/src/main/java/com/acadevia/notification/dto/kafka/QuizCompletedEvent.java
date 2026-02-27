package com.acadevia.notification.dto.kafka;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor @AllArgsConstructor
@Builder
public class QuizCompletedEvent {
    private Long userId;
    private Long quizId;
    private String quizTitle;
    private Integer score;
    private Integer maxScore;
    private Double accuracy;
    private Integer xpEarned;
    private LocalDateTime timestamp;
}
