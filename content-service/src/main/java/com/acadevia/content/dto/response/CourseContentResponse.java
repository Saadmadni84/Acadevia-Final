package com.acadevia.content.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseContentResponse {

    private Long courseId;
    private Map<Long, List<VideoSummaryResponse>> moduleVideos;
    private Integer totalVideos;
    private Integer totalDurationSeconds;
    private Double overallWatchProgress;
    private Integer totalPopQuestions;
    private Integer answeredPopQuestions;
}
