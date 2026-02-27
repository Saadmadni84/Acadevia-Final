package com.acadevia.game.dto.response;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class MultiplayerGameResultResponse {
    private String sessionCode;
    private Long gameId;
    
    private Long winnerUserId;
    private List<PlayerResult> results;
    
    private LocalDateTime completedAt;

    @Data
    public static class PlayerResult {
        private Long userId;
        private String displayName;
        private String avatarUrl;
        
        private Integer rank;
        private Integer score;
        private Integer timeTakenSec;
        
        private Integer xpEarned;
        private Integer creditsEarned;
    }
}
