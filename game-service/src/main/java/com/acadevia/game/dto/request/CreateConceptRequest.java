package com.acadevia.game.dto.request;

import com.acadevia.game.entity.enums.GameDifficulty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class CreateConceptRequest {
    @NotNull
    private Long chapterId;
    
    @NotBlank
    private String title;
    private String titleLocal;
    private String description;
    
    private List<String> keyPoints;
    private List<String> formulas;
    private Map<String, String> definitions;
    private List<String> examples;
    
    @NotNull
    private Integer sequenceOrder;
    
    private GameDifficulty difficulty;
    private String iconUrl;
}
