package com.acadevia.content.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VideoSummaryResponse {

    private Long id;
    private Long lessonId;
    private Long courseId;
    private Long moduleId;
    private Integer classGrade;
    private String subject;
    private String chapter;
    private String title;
    private String description;
    private Long createdBy;
    private Integer totalComments;
    private String originalFilename;
    private String contentType;
    private Long fileSizeBytes;
    private Double fileSizeMb;
    private String thumbnailUrl;
    private String playUrl;
    private String downloadUrl;
    private List<VideoQualityOption> downloadOptions;
    private Integer durationSeconds;
    private String languageCode;
    private Integer totalViews;
    private Double avgWatchPct;
    private Integer totalPopQuestions;
    private Boolean isActive;
    private Boolean isProcessing;
    private LocalDateTime createdAt;
}
