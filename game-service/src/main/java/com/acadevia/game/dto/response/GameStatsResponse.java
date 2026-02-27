package com.acadevia.game.dto.response;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class GameStatsResponse {
    private Long gameId;
    private Integer totalPlays;
    private Integer totalWins;
    private Integer uniquePlayers;
    private BigDecimal avgScore;
    private Integer avgTimeSec;
    private BigDecimal completionRate;
}
