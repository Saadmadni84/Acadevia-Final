package com.acadevia.game.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class JoinMultiplayerGameRequest {
    @NotBlank
    private String sessionCode;
}
