package com.acadevia.game.dto.request;

import com.acadevia.game.entity.enums.GameDifficulty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateMultiplayerGameRequest {
    @NotNull
    private Long gameId;
    
    private Integer maxPlayers;
    private GameDifficulty difficulty;
    private Integer timeLimitSec;
    private Integer rounds;
}
