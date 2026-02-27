package com.acadevia.game.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateChapterRequest {
    @NotBlank
    private String subjectCode;
    
    @Min(1) @Max(12)
    @NotNull
    private Integer classGrade;
    
    @NotBlank
    private String title;
    private String titleLocal;
    private String description;
    
    @NotNull
    private Integer sequenceOrder;
    private String iconUrl;
}
