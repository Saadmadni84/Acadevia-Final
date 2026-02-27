package com.acadevia.game.dto.response;

import lombok.Data;

@Data
public class GameCardResponse {
    private Long id;
    private String title;
    private String description;
    
    private String gameType;
    private String difficulty;
    private String language;
    
    private String thumbnailUrl;
    
    private Integer timeLimitSec;
    private Integer maxScore;
    
    private Boolean isMultiplayer;
    private Integer minPlayers;
    private Integer maxPlayers;
    
    private Integer totalPlays;
    private Double avgScore;
    
    private Integer xpReward;
    private Integer creditReward;
    
    private String subjectCode;
    private String subjectName;
    
    private String chapterTitle;
    private String conceptTitle;
    
    private Integer classGrade;
    
    private Boolean isFeatured;
    
    private ConceptMasteryResponse userMastery;
}
