package com.acadevia.content.dto.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VideoCompletedEvent {

    private Long videoId;
    private Long userId;
    private Long lessonId;
    private Long courseId;
    private Long moduleId;
    private Integer durationSeconds;
    private Integer totalWatchedSec;
    private Double watchPercentage;
    private Integer sessionCount;
    private LocalDateTime completedAt;
    private String eventType;

    @Builder.Default
    private String source = "content-service";
}
