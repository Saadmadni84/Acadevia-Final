package com.acadevia.game.dto.response;

import com.acadevia.game.entity.enums.GameDifficulty;
import com.acadevia.game.entity.enums.GameType;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class GameResponse {
    private Long id;
    private Long conceptId;
    private Long chapterId;
    private Long subjectId;
    private Integer classGrade;
    
    private String title;
    private String titleLocal;
    private String description;
    private String instructions;
    
    private GameType gameType;
    private GameDifficulty difficulty;
    private String language;
    
    private Integer timeLimitSec;
    private Integer minPlayers;
    private Integer maxPlayers;
    private Boolean isMultiplayer;
    
    private Integer xpReward;
    private Integer creditReward;
    
    private Integer maxScore;
    
    private String thumbnailUrl;
    private String backgroundUrl;
    
    private Integer totalPlays;
    private BigDecimal avgScore;
    
    private Boolean isFeatured;
    private Boolean isActive;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
