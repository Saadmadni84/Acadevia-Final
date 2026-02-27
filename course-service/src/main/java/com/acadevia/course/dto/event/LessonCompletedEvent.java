package com.acadevia.course.dto.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LessonCompletedEvent {
    private Long userId;
    private Long lessonId;
    private Long courseId;
    private Long moduleId;
    private String contentType;
    private Integer timeSpentSec;
    private Integer xpReward;
    private LocalDateTime completedAt;
}
