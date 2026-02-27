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
@Table(name = "video_bookmarks", indexes = {
    @Index(name = "idx_vb_user", columnList = "user_id"),
    @Index(name = "idx_vb_video", columnList = "video_id"),
    @Index(name = "idx_vb_user_video", columnList = "user_id, video_id"),
    @Index(name = "idx_vb_timestamp", columnList = "video_id, timestamp_sec")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class VideoBookmark {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "video_id", nullable = false)
    private Long videoId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "timestamp_sec", nullable = false)
    private Integer timestampSec;

    @Column(length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(length = 10)
    @Builder.Default
    private String color = "#FFD700";

    @Column(name = "is_important")
    @Builder.Default
    private Boolean isImportant = false;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
