package com.acadevia.game.dto.game;

import com.acadevia.game.entity.enums.GameDifficulty;
import com.acadevia.game.entity.enums.GameMode;
import com.acadevia.game.entity.enums.GameType;
import lombok.Data;

@Data
public class GameSearchCriteria {
    private String query;
    private GameType type;
    private GameMode mode;
    private GameDifficulty difficulty;
    private Long subjectId;
    private Long chapterId;
    private Long conceptId;
    private Boolean isFeatured;
}
