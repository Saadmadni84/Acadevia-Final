package com.acadevia.game.dto.event;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class GameCompletedEvent {
    private Long userId;
    private Long gameId;
    private String gameType;
    private String subject;
    private String topic;
    private Long conceptId;
    private Long chapterId;
    private Integer classGrade;
    private Integer score;
    private Integer maxScore;
    private Double percentage;
    private Integer timeTakenSec;
    private Boolean isWon;
    private Boolean isPerfect;
    private Integer xpEarned;
    private Integer creditsEarned;
    private String gameMode;
    private String difficulty;
    private LocalDateTime completedAt;
}
