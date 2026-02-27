package com.acadevia.content.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VideoSummaryResponse {

    private Long id;
    private Long lessonId;
    private Long courseId;
    private Long moduleId;
    private String title;
    private String thumbnailUrl;
    private Integer durationSeconds;
    private String languageCode;
    private Integer totalViews;
    private Double avgWatchPct;
    private Integer totalPopQuestions;
    private Boolean isActive;
    private Boolean isProcessing;
    private LocalDateTime createdAt;
}
