package com.acadevia.content.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "video_notes", indexes = {
    @Index(name = "idx_vn_user", columnList = "user_id"),
    @Index(name = "idx_vn_video", columnList = "video_id"),
    @Index(name = "idx_vn_user_video", columnList = "user_id, video_id"),
    @Index(name = "idx_vn_timestamp", columnList = "video_id, timestamp_sec")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class VideoNote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "video_id", nullable = false)
    private Long videoId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "timestamp_sec", nullable = false)
    private Integer timestampSec;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "formatted_content", columnDefinition = "MEDIUMTEXT")
    private String formattedContent;

    @Column(name = "has_drawing")
    @Builder.Default
    private Boolean hasDrawing = false;

    @Column(name = "drawing_data", columnDefinition = "MEDIUMTEXT")
    private String drawingData;

    @Column(name = "screenshot_url", length = 500)
    private String screenshotUrl;

    @Column(name = "is_pinned")
    @Builder.Default
    private Boolean isPinned = false;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
