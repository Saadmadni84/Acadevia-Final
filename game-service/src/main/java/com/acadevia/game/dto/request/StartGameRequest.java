package com.acadevia.game.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StartGameRequest {
    @NotNull
    private Long gameId;
    
    // Optional parameter to select challenge mode or solo
    private Boolean isChallenge = false;
}
