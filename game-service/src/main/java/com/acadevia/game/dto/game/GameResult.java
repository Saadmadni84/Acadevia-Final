package com.acadevia.game.dto.game;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
public class GameResult {
    private Integer score;
    private Integer maxScore;
    private BigDecimal percentage;
    private Boolean isWon;
    private Boolean isPerfect;
    private Integer xpEarned;
    private Integer creditsEarned;
    private Map<String, Object> resultDetails;
}
