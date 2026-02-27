package com.acadevia.game.dto.request;

import com.acadevia.game.entity.enums.GameType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.Map;

@Data
public class SubmitGameRequest {
    @NotNull
    private Long attemptId;
    
    private GameType gameType;
    
    @NotNull
    private Map<String, Object> submissionData;
}
