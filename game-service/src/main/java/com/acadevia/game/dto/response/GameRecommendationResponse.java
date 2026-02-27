package com.acadevia.game.dto.response;

import lombok.Data;

@Data
public class GameRecommendationResponse {
    private GameCardResponse game;
    private String reason;  // "Strengthen your weak area: Trigonometry"
    private String priority;  // "HIGH", "MEDIUM", "LOW"
}
