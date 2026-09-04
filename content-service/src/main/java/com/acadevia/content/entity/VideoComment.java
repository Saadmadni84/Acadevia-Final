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
@Table(name = "video_comments", indexes = {
    @Index(name = "idx_vc_video", columnList = "video_id"),
    @Index(name = "idx_vc_user", columnList = "user_id"),
    @Index(name = "idx_vc_read", columnList = "is_read"),
    @Index(name = "idx_vc_created_at", columnList = "created_at")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class VideoComment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "video_id", nullable = false)
    private Long videoId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "user_name", nullable = false)
    private String userName;

    @Column(name = "user_role", length = 50)
    @Builder.Default
    private String userRole = "STUDENT";

    @Column(nullable = false, columnDefinition = "TEXT")
    private String comment;

    @Column(name = "is_read")
    @Builder.Default
    private Boolean isRead = false;

    @Column(name = "is_resolved")
    @Builder.Default
    private Boolean isResolved = false;

    @Column(name = "reply", columnDefinition = "TEXT")
    private String reply;

    @Column(name = "replied_by_name")
    private String repliedByName;

    @Column(name = "replied_at")
    private LocalDateTime repliedAt;

    @Column(name = "parent_id")
    private Long parentId;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
