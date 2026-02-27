package com.acadevia.course.entity;

import com.acadevia.course.enums.ContentType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "lessons", 
    uniqueConstraints = @UniqueConstraint(columnNames = {"module_id", "sequence_order"}),
    indexes = {
        @Index(name = "idx_lesson_module", columnList = "module_id"),
        @Index(name = "idx_lesson_course", columnList = "course_id"),
        @Index(name = "idx_lesson_type", columnList = "content_type"),
        @Index(name = "idx_lesson_active", columnList = "is_active"),
        @Index(name = "idx_lesson_video", columnList = "video_id"),
        @Index(name = "idx_lesson_quiz", columnList = "quiz_id"),
        @Index(name = "idx_lesson_game", columnList = "game_id")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Lesson {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id", nullable = false)
    private Module module;

    @Column(name = "course_id", nullable = false)
    private Long courseId;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "content_type", nullable = false)
    private ContentType contentType;

    @Column(name = "content_url", length = 500)
    private String contentUrl;

    @Column(name = "content_text", columnDefinition = "LONGTEXT")
    private String contentText;

    @Column(name = "video_id")
    private Long videoId;

    @Column(name = "quiz_id")
    private Long quizId;

    @Column(name = "game_id")
    private Long gameId;

    @Column(name = "duration_minutes")
    @Builder.Default
    private Integer durationMinutes = 0;

    @Column(name = "sequence_order", nullable = false)
    private Integer sequenceOrder;

    @Column(name = "xp_reward")
    @Builder.Default
    private Integer xpReward = 10;

    @Column(name = "is_free_preview")
    @Builder.Default
    private Boolean isFreePreview = false;

    @Column(name = "is_mandatory")
    @Builder.Default
    private Boolean isMandatory = true;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(length = 20)
    @Builder.Default
    private String language = "en";

    @Convert(converter = JsonListConverter.class)
    @Column(name = "attachment_urls", columnDefinition = "JSON")
    private List<String> attachmentUrls;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
