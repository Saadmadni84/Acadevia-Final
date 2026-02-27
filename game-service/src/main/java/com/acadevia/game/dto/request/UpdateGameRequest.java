package com.acadevia.game.dto.request;

import com.acadevia.game.entity.enums.GameDifficulty;
import lombok.Data;
import java.util.List;

@Data
public class UpdateGameRequest {
    private String title;
    private String titleLocal;
    private String description;
    private String instructions;
    private GameDifficulty difficulty;
    private Object gameData;
    private Integer timeLimitSec;
    private Boolean isMultiplayer;
    private Integer xpReward;
    private Integer creditReward;
    private Integer maxScore;
    private Integer passScore;
    private String thumbnailUrl;
    private String backgroundUrl;
    private List<String> tags;
    private String topic;
    private Boolean isActive;
}
