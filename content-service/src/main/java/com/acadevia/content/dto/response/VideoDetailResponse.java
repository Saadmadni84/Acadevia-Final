package com.acadevia.content.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VideoDetailResponse {

    private Long id;
    private Long lessonId;
    private Long courseId;
    private Long moduleId;
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

    private Integer durationSeconds;
    private String thumbnailUrl;
    private String posterUrl;
    private String transcriptUrl;
    private Boolean isDownloadable;
    private Boolean allowSpeedControl;
    private String minQuality;
    private String defaultQuality;

    private Integer totalViews;
    private Integer uniqueViewers;
    private Double avgWatchPct;
    private Long totalWatchTimeSec;
    private Integer totalPopQuestions;
    private Double avgPopAccuracy;
    private Integer totalDownloads;
    private Integer totalBookmarks;
    private Integer totalNotes;
    private Integer likeCount;
    private Integer dislikeCount;

    private List<VideoResponse.ChapterMarkerResponse> chapterMarkers;
    private List<VideoResponse.VideoQualityInfo> availableQualities;
    private List<SubtitleResponse> subtitles;
    private List<PopQuestionResponse> popQuestions;
    private WatchProgressResponse userProgress;

    private Long createdBy;
    private Long schoolId;
    private Boolean isActive;
    private Boolean isProcessing;
    private LocalDateTime publishedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
