package com.acadevia.game.dto.response;

import lombok.Data;

@Data
public class GameStartResponse {
    private Long gameId;
    private String gameType;
    private String title;
    private Integer timeLimitSec;
    private Integer maxScore;
    private Object gameData;  // cleaned data WITHOUT answers
    private String difficulty;
}
