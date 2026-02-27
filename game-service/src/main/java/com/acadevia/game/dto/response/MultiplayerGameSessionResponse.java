package com.acadevia.game.dto.response;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class MultiplayerGameSessionResponse {
    private String sessionCode;
    private Long gameId;
    private Long hostUserId;
    
    private String status;
    private Integer maxPlayers;
    private Integer currentPlayers;
    
    private Integer currentRound;
    private Integer rounds;
    private String difficulty;
    
    private List<MultiplayerPlayerInfo> players;
    
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    
    @Data
    public static class MultiplayerPlayerInfo {
        private Long userId;
        private String displayName;
        private String avatarUrl;
        private Boolean isReady;
        private Boolean isConnected;
        private Integer score;
    }
}
