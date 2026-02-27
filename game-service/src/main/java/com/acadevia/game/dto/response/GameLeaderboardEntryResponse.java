package com.acadevia.game.dto.response;

import lombok.Data;

@Data
public class GameLeaderboardEntryResponse {
    private Long userId;
    private String displayName;
    private String avatarUrl;
    
    private Integer rank;
    private Integer bestScore;
    private Integer bestTimeSec;
    
    private Integer totalPlays;
    private Integer totalWins;
    
    private Double winRate;
    private Integer bestStreak;
}
