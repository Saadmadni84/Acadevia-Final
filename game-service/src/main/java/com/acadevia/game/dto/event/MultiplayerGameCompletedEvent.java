package com.acadevia.game.dto.event;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class MultiplayerGameCompletedEvent {
    private String sessionCode;
    private Long gameId;
    private Long winnerUserId;
    private List<PlayerResult> results;
    private LocalDateTime completedAt;

    @Data
    @Builder
    public static class PlayerResult {
        private Long userId;
        private Integer rank;
        private Integer score;
        private Integer xpEarned;
        private Integer creditsEarned;
    }
}
