package com.acadevia.course.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateModuleRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    private Integer sequenceOrder; // optional, auto-calculated if not provided

    @Builder.Default
    private Integer xpReward = 20;

    @Builder.Default
    private Boolean isFreePreview = false;
}
