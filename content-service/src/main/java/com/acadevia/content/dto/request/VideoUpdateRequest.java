package com.acadevia.content.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
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
public class VideoUpdateRequest {

    @Size(max = 255, message = "Title must be at most 255 characters")
    private String title;

    private String description;

    private String summary;

    private List<String> summaryPoints;

    private List<String> keyFormulas;

    private List<String> keyDefinitions;

    private String languageCode;

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

    @Min(value = 1, message = "Duration must be at least 1 second")
    private Integer durationSeconds;

    private String thumbnailUrl;
    private String posterUrl;
    private String transcriptUrl;

    private Boolean isDownloadable;
    private Boolean allowSpeedControl;

    private String minQuality;
    private String defaultQuality;

    private List<VideoCreateRequest.ChapterMarkerRequest> chapterMarkers;

    private Boolean isActive;
}
