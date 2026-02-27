package com.acadevia.game.dto.response;

import lombok.Data;
import java.util.List;
import lombok.Builder;

@Data
@Builder
public class GameResultResponse {
    private Long attemptId;
    private Long gameId;
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
    
    private List<ItemResult> itemResults;
    
    private String masteryLevel;
    private Double masteryProgress;
    
    private GameLeaderboardEntryResponse leaderboardPosition;
    
    private String encouragement;

    @Data
    @Builder
    public static class ItemResult {
        private Integer index;
        private Boolean isCorrect;
        private Integer pointsEarned;
        private String feedback;
    }
}
