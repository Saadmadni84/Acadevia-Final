package com.acadevia.course.entity;

import com.acadevia.course.enums.EnrollmentStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "enrollments", 
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "course_id"}),
    indexes = {
        @Index(name = "idx_enrollment_user", columnList = "user_id"),
        @Index(name = "idx_enrollment_course", columnList = "course_id"),
        @Index(name = "idx_enrollment_status", columnList = "status"),
        @Index(name = "idx_enrollment_progress", columnList = "progress_pct"),
        @Index(name = "idx_enrollment_enrolled", columnList = "enrolled_at"),
        @Index(name = "idx_enrollment_last_access", columnList = "last_accessed_at")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "ENUM('ACTIVE', 'COMPLETED', 'DROPPED', 'PAUSED', 'EXPIRED') DEFAULT 'ACTIVE'")
    @Builder.Default
    private EnrollmentStatus status = EnrollmentStatus.ACTIVE;

    @Column(name = "progress_pct")
    @Builder.Default
    private Double progressPct = 0.00;

    @Column(name = "completed_lessons")
    @Builder.Default
    private Integer completedLessons = 0;

    @Column(name = "total_lessons")
    private Integer totalLessons;

    @Column(name = "total_time_spent_min")
    @Builder.Default
    private Integer totalTimeSpentMin = 0;

    @Column(name = "xp_earned")
    @Builder.Default
    private Integer xpEarned = 0;

    @Column(name = "last_lesson_id")
    private Long lastLessonId;

    @Column(name = "last_accessed_at")
    private LocalDateTime lastAccessedAt;

    @CreatedDate
    @Column(name = "enrolled_at", updatable = false)
    private LocalDateTime enrolledAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "dropped_at")
    private LocalDateTime droppedAt;

    @Column(name = "certificate_id")
    private String certificateId;

    @Column(name = "certificate_url", length = 500)
    private String certificateUrl;
}
