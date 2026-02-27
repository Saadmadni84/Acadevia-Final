package com.acadevia.course.entity;

import com.acadevia.course.enums.LessonStatus;
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
@Table(name = "lesson_progress", 
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "lesson_id"}),
    indexes = {
        @Index(name = "idx_lp_user", columnList = "user_id"),
        @Index(name = "idx_lp_lesson", columnList = "lesson_id"),
        @Index(name = "idx_lp_course", columnList = "course_id"),
        @Index(name = "idx_lp_module", columnList = "module_id"),
        @Index(name = "idx_lp_enrollment", columnList = "enrollment_id"),
        @Index(name = "idx_lp_completed", columnList = "is_completed"),
        @Index(name = "idx_lp_user_course", columnList = "user_id, course_id")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class LessonProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    @Column(name = "course_id", nullable = false)
    private Long courseId;

    @Column(name = "module_id", nullable = false)
    private Long moduleId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enrollment_id", nullable = false)
    private Enrollment enrollment;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default
    private LessonStatus status = LessonStatus.NOT_STARTED;

    @Column(name = "is_completed")
    @Builder.Default
    private Boolean isCompleted = false;

    @Column(name = "progress_pct")
    @Builder.Default
    private Double progressPct = 0.00;

    @Column(name = "time_spent_sec")
    @Builder.Default
    private Integer timeSpentSec = 0;

    @Column(name = "last_position")
    @Builder.Default
    private Integer lastPosition = 0;

    @Column(name = "attempts")
    @Builder.Default
    private Integer attempts = 1;

    @Column(name = "score")
    private Integer score;

    @CreatedDate
    @Column(name = "started_at", updatable = false)
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
