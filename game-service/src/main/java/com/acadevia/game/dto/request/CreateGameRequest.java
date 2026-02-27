package com.acadevia.game.dto.request;

import com.acadevia.game.entity.enums.GameDifficulty;
import com.acadevia.game.entity.enums.GameType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class CreateGameRequest {
    @NotNull
    private Long conceptId;
    
    @NotBlank
    private String title;
    private String titleLocal;
    private String description;
    private String instructions;
    
    @NotNull
    private GameType gameType;
    private GameDifficulty difficulty;
    private String language;
    
    @NotNull
    private Object gameData; // Pass as JSON object
    
    private Integer timeLimitSec;
    private Integer minPlayers;
    private Integer maxPlayers;
    private Boolean isMultiplayer;
    
    private Integer xpReward;
    private Integer creditReward;
    
    private Integer maxScore;
    private Integer passScore;
    
    private String thumbnailUrl;
    private String backgroundUrl;
    
    private List<String> tags;
    private String topic;
    
    private Long schoolId;
}
