package com.acadevia.game.dto.response;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.Map;

@Data
public class ConceptMasteryResponse {
    private Long conceptId;
    private String conceptTitle;
    
    private String masteryLevel;
    private Double masteryScore;
    
    private Integer totalGamesPlayed;
    private Integer totalGamesWon;
    
    private Double avgGameScore;
    
    private Integer gamesToNextLevel;
    
    private Map<String, Double> gameTypeScores;
    
    private LocalDateTime lastPlayedAt;
    private LocalDateTime masteredAt;
}
