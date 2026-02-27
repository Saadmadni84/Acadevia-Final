package com.acadevia.content.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VideoCreateRequest {

    @NotNull(message = "Lesson ID is required")
    private Long lessonId;

    @NotNull(message = "Course ID is required")
    private Long courseId;

    @NotNull(message = "Module ID is required")
    private Long moduleId;

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must be at most 255 characters")
    private String title;

    private String description;

    private String summary;

    private List<String> summaryPoints;

    private List<String> keyFormulas;

    private List<String> keyDefinitions;

    @Builder.Default
    private String languageCode = "en";

    private String url144p;
    private String url240p;
    private String url360p;
    private String url480p;
    private String url720p;
    private String url1080p;

    private BigDecimal size144pMb;
    private BigDecimal size240pMb;
    private BigDecimal size360pMb;
    private BigDecimal size480pMb;
    private BigDecimal size720pMb;
    private BigDecimal size1080pMb;

    @NotNull(message = "Duration is required")
    @Min(value = 1, message = "Duration must be at least 1 second")
    private Integer durationSeconds;

    private String thumbnailUrl;
    private String posterUrl;
    private String transcriptUrl;

    @Builder.Default
    private Boolean isDownloadable = true;

    @Builder.Default
    private Boolean allowSpeedControl = true;

    private String minQuality;
    private String defaultQuality;

    private List<ChapterMarkerRequest> chapterMarkers;

    @NotNull(message = "Creator ID is required")
    private Long createdBy;

    private Long schoolId;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChapterMarkerRequest {
        @NotNull(message = "Timestamp is required")
        private Integer timestamp;

        @NotBlank(message = "Title is required")
        private String title;
    }
}
