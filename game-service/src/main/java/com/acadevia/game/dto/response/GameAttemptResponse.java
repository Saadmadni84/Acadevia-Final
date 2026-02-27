package com.acadevia.game.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class GameAttemptResponse {
    private Long id;
    private Long gameId;
    private Long userId;
    private String gameTitle;
    private String gameType;
    
    private Integer score;
    private Integer maxScore;
    private Double percentage;
    private Integer timeTakenSec;
    
    private Boolean isWon;
    private Boolean isPerfect;
    private Boolean isSpeedBonus;
    
    private Integer xpEarned;
    private Integer creditsEarned;
    
    private String gameMode;
    private String difficultyPlayed;
    
    private LocalDateTime playedAt;
}
