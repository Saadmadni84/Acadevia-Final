package com.acadevia.content.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LessonContentResponse {

    private Long lessonId;
    private Long courseId;
    private Long moduleId;
    private List<VideoSummaryResponse> videos;
    private Integer totalVideos;
    private Integer totalDurationSeconds;
    private Double overallWatchProgress;
    private Integer totalPopQuestions;
}
