package com.acadevia.content.entity;

import com.acadevia.content.entity.enums.DownloadStatus;
import com.acadevia.content.entity.enums.VideoQuality;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "video_downloads", indexes = {
    @Index(name = "idx_vd_user", columnList = "user_id"),
    @Index(name = "idx_vd_video", columnList = "video_id"),
    @Index(name = "idx_vd_lesson", columnList = "lesson_id"),
    @Index(name = "idx_vd_course", columnList = "course_id"),
    @Index(name = "idx_vd_status", columnList = "download_status"),
    @Index(name = "idx_vd_token", columnList = "download_token"),
    @Index(name = "idx_vd_expires", columnList = "expires_at"),
    @Index(name = "idx_vd_user_video", columnList = "user_id, video_id")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VideoDownload {

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

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private VideoQuality quality;

    @Column(name = "file_size_mb", precision = 8, scale = 2, nullable = false)
    private BigDecimal fileSizeMb;

    @Column(name = "download_url", length = 500)
    private String downloadUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "download_status", length = 20)
    @Builder.Default
    private DownloadStatus downloadStatus = DownloadStatus.QUEUED;

    @Column(name = "download_progress_pct")
    @Builder.Default
    private Double downloadProgressPct = 0.0;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "retry_count")
    @Builder.Default
    private Integer retryCount = 0;

    @Column(name = "max_retries")
    @Builder.Default
    private Integer maxRetries = 3;

    @Column(name = "download_token", unique = true)
    private String downloadToken;

    @Column(name = "token_expires_at")
    private LocalDateTime tokenExpiresAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "requested_at")
    @Builder.Default
    private LocalDateTime requestedAt = LocalDateTime.now();

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "device_id", length = 100)
    private String deviceId;

    @Column(name = "device_type", length = 50)
    private String deviceType;

    @Column(name = "os_version", length = 50)
    private String osVersion;

    @Column(name = "app_version", length = 20)
    private String appVersion;

    @Column(name = "network_type", length = 20)
    private String networkType;
}
