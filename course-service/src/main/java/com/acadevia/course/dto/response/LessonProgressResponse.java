package com.acadevia.course.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LessonProgressResponse {
    private Long lessonId;
    private String lessonTitle;
    private Boolean isCompleted;
    private Double progressPct;
    private Integer timeSpentSec;
    private Integer lastPosition;
    private Integer attempts;
    private Integer score;
    private Integer xpEarned;
    private Boolean isCourseCompleted;
    private Double updatedCourseProgress;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
}
