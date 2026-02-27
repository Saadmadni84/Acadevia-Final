package com.acadevia.content.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "video_watch_progress",
    uniqueConstraints = @UniqueConstraint(name = "uk_watch_progress", columnNames = {"video_id", "user_id"}),
    indexes = {
        @Index(name = "idx_vwp_user", columnList = "user_id"),
        @Index(name = "idx_vwp_video", columnList = "video_id"),
        @Index(name = "idx_vwp_lesson", columnList = "lesson_id"),
        @Index(name = "idx_vwp_course", columnList = "course_id"),
        @Index(name = "idx_vwp_completed", columnList = "is_completed")
    })
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class VideoWatchProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "video_id", nullable = false)
    private Long videoId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "lesson_id", nullable = false)
    private Long lessonId;

    @Column(name = "course_id", nullable = false)
    private Long courseId;

    @Column(name = "watched_seconds")
    @Builder.Default
    private Integer watchedSeconds = 0;

    @Column(name = "total_seconds", nullable = false)
    private Integer totalSeconds;

    @Column(name = "watch_percentage")
    @Builder.Default
    private Double watchPercentage = 0.0;

    @Column(name = "is_completed")
    @Builder.Default
    private Boolean isCompleted = false;

    @Column(name = "last_position_sec")
    @Builder.Default
    private Integer lastPositionSec = 0;

    @Column(name = "quality_watched", length = 10)
    @Builder.Default
    private String lastQuality = "360p";

    @Column(name = "playback_speed")
    @Builder.Default
    private Double lastPlaybackSpeed = 1.0;

    @Column(name = "pop_questions_total")
    @Builder.Default
    private Integer popQuestionsTotal = 0;

    @Column(name = "pop_questions_answered")
    @Builder.Default
    private Integer popQuestionsAnswered = 0;

    @Column(name = "pop_questions_correct")
    @Builder.Default
    private Integer popQuestionsCorrect = 0;

    @Column(name = "pop_accuracy_pct")
    @Builder.Default
    private Double popAccuracyPct = 0.0;

    @Column(name = "rewatch_count")
    @Builder.Default
    private Integer rewatchCount = 0;

    @Column(name = "total_watched_sec")
    @Builder.Default
    private Integer totalWatchedSec = 0;

    @Column(name = "session_count")
    @Builder.Default
    private Integer sessionCount = 0;

    @Column(name = "pause_count")
    @Builder.Default
    private Integer pauseCount = 0;

    @Column(name = "seek_count")
    @Builder.Default
    private Integer seekCount = 0;

    @Convert(converter = RewatchSectionConverter.class)
    @Column(name = "rewatched_sections", columnDefinition = "JSON")
    @Builder.Default
    private List<RewatchSection> rewatchSections = new ArrayList<>();

    @Column(name = "first_watched_at")
    private LocalDateTime firstWatchedAt;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "last_watched_at")
    @Builder.Default
    private LocalDateTime lastWatchedAt = LocalDateTime.now();

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
