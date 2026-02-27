package com.acadevia.course.dto.response;

import lombok.AllArgsConstructor;
import lombok.experimental.SuperBuilder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class ModuleResponse {
    private Long id;
    private String title;
    private String description;
    private Integer sequenceOrder;
    private Integer totalLessons;
    private Integer totalDurationMin;
    private Integer xpReward;
    private Boolean isFreePreview;
}
