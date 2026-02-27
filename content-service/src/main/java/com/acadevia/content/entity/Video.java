package com.acadevia.content.entity;

import com.acadevia.content.entity.enums.VideoQuality;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "videos", indexes = {
    @Index(name = "idx_video_lesson", columnList = "lesson_id"),
    @Index(name = "idx_video_course", columnList = "course_id"),
    @Index(name = "idx_video_module", columnList = "module_id"),
    @Index(name = "idx_video_language", columnList = "language_code"),
    @Index(name = "idx_video_creator", columnList = "created_by"),
    @Index(name = "idx_video_school", columnList = "school_id"),
    @Index(name = "idx_video_active", columnList = "is_active"),
    @Index(name = "idx_video_downloadable", columnList = "is_downloadable")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Video {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "lesson_id", nullable = false)
    private Long lessonId;

    @Column(name = "course_id", nullable = false)
    private Long courseId;

    @Column(name = "module_id", nullable = false)
    private Long moduleId;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Convert(converter = JsonStringListConverter.class)
    @Column(name = "summary_points", columnDefinition = "JSON")
    private List<String> summaryPoints;

    @Convert(converter = JsonStringListConverter.class)
    @Column(name = "key_formulas", columnDefinition = "JSON")
    private List<String> keyFormulas;

    @Convert(converter = JsonStringListConverter.class)
    @Column(name = "key_definitions", columnDefinition = "JSON")
    private List<String> keyDefinitions;

    @Column(name = "language_code", length = 20, nullable = false)
    @Builder.Default
    private String languageCode = "en";

    @Column(name = "url_144p", length = 500)
    private String url144p;

    @Column(name = "url_240p", length = 500)
    private String url240p;

    @Column(name = "url_360p", length = 500)
    private String url360p;

    @Column(name = "url_480p", length = 500)
    private String url480p;

    @Column(name = "url_720p", length = 500)
    private String url720p;

    @Column(name = "url_1080p", length = 500)
    private String url1080p;

    @Column(name = "size_144p_mb", precision = 8, scale = 2)
    private BigDecimal size144pMb;

    @Column(name = "size_240p_mb", precision = 8, scale = 2)
    private BigDecimal size240pMb;

    @Column(name = "size_360p_mb", precision = 8, scale = 2)
    private BigDecimal size360pMb;

    @Column(name = "size_480p_mb", precision = 8, scale = 2)
    private BigDecimal size480pMb;

    @Column(name = "size_720p_mb", precision = 8, scale = 2)
    private BigDecimal size720pMb;

    @Column(name = "size_1080p_mb", precision = 8, scale = 2)
    private BigDecimal size1080pMb;

    @Column(name = "duration_seconds", nullable = false)
    private Integer durationSeconds;

    @Column(name = "thumbnail_url", length = 500)
    private String thumbnailUrl;

    @Column(name = "poster_url", length = 500)
    private String posterUrl;

    @Column(name = "transcript_url", length = 500)
    private String transcriptUrl;

    @Column(name = "is_downloadable")
    @Builder.Default
    private Boolean isDownloadable = true;

    @Column(name = "allow_speed_control")
    @Builder.Default
    private Boolean allowSpeedControl = true;

    @Enumerated(EnumType.STRING)
    @Column(name = "min_quality", length = 10)
    @Builder.Default
    private VideoQuality minQuality = VideoQuality._144P;

    @Enumerated(EnumType.STRING)
    @Column(name = "default_quality", length = 10)
    @Builder.Default
    private VideoQuality defaultQuality = VideoQuality._360P;

    @Column(name = "total_views")
    @Builder.Default
    private Integer totalViews = 0;

    @Column(name = "unique_viewers")
    @Builder.Default
    private Integer uniqueViewers = 0;

    @Column(name = "avg_watch_pct")
    @Builder.Default
    private Double avgWatchPct = 0.0;

    @Column(name = "total_watch_time_sec")
    @Builder.Default
    private Long totalWatchTimeSec = 0L;

    @Column(name = "total_pop_questions")
    @Builder.Default
    private Integer totalPopQuestions = 0;

    @Column(name = "avg_pop_accuracy")
    @Builder.Default
    private Double avgPopAccuracy = 0.0;

    @Column(name = "total_downloads")
    @Builder.Default
    private Integer totalDownloads = 0;

    @Column(name = "total_bookmarks")
    @Builder.Default
    private Integer totalBookmarks = 0;

    @Column(name = "total_notes")
    @Builder.Default
    private Integer totalNotes = 0;

    @Column(name = "like_count")
    @Builder.Default
    private Integer likeCount = 0;

    @Column(name = "dislike_count")
    @Builder.Default
    private Integer dislikeCount = 0;

    @Convert(converter = ChapterMarkerConverter.class)
    @Column(name = "chapter_markers", columnDefinition = "JSON")
    private List<ChapterMarker> chapterMarkers;

    @Column(name = "created_by", nullable = false)
    private Long createdBy;

    @Column(name = "school_id")
    private Long schoolId;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "is_processing")
    @Builder.Default
    private Boolean isProcessing = false;

    @Column(name = "processing_status", length = 50)
    private String processingStatus;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "video", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<VideoPopQuestion> popQuestions = new ArrayList<>();

    @OneToMany(mappedBy = "video", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<VideoSubtitle> subtitles = new ArrayList<>();
}
