package com.acadevia.course.dto.response;

import lombok.AllArgsConstructor;
import lombok.experimental.SuperBuilder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class LessonResponse {
    private Long id;
    private String title;
    private String description;
    private String contentType;
    private Integer durationMinutes;
    private Integer sequenceOrder;
    private Integer xpReward;
    private Boolean isFreePreview;
    private Boolean isMandatory;
    private String language;
    private Long videoId;
    private Long quizId;
    private Long gameId;
    private Boolean isCompleted;
}
