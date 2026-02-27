package com.acadevia.course.entity;

import com.acadevia.course.enums.Board;
import com.acadevia.course.enums.CourseStatus;
import com.acadevia.course.enums.DifficultyLevel;
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
@Table(name = "courses", indexes = {
    @Index(name = "idx_course_category", columnList = "category"),
    @Index(name = "idx_course_subject", columnList = "subject"),
    @Index(name = "idx_course_class", columnList = "class_grade"),
    @Index(name = "idx_course_board", columnList = "board"),
    @Index(name = "idx_course_language", columnList = "language"),
    @Index(name = "idx_course_teacher", columnList = "teacher_id"),
    @Index(name = "idx_course_school", columnList = "school_id"),
    @Index(name = "idx_course_status", columnList = "status"),
    @Index(name = "idx_course_difficulty", columnList = "difficulty_level"),
    @Index(name = "idx_course_enrolled", columnList = "total_enrolled"),
    @Index(name = "idx_course_featured", columnList = "is_featured, featured_order"),
    @Index(name = "idx_course_published", columnList = "published_at"),
    @Index(name = "idx_course_free", columnList = "is_free")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "short_description", length = 500)
    private String shortDescription;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String subject;

    @Column(name = "class_grade", nullable = false)
    private Integer classGrade;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "ENUM('CBSE', 'ICSE', 'STATE_BOARD', 'IB', 'IGCSE', 'NIOS', 'ALL') DEFAULT 'ALL'")
    @Builder.Default
    private Board board = Board.ALL;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String language = "en";

    @Column(name = "thumbnail_url", length = 500)
    private String thumbnailUrl;

    @Column(name = "preview_video_url", length = 500)
    private String previewVideoUrl;

    @Column(name = "teacher_id", nullable = false)
    private Long teacherId;

    @Column(name = "school_id")
    private Long schoolId;

    @Enumerated(EnumType.STRING)
    @Column(name = "difficulty_level", columnDefinition = "ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED') DEFAULT 'BEGINNER'")
    @Builder.Default
    private DifficultyLevel difficultyLevel = DifficultyLevel.BEGINNER;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "ENUM('DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'ARCHIVED', 'REJECTED') DEFAULT 'DRAFT'")
    @Builder.Default
    private CourseStatus status = CourseStatus.DRAFT;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "xp_reward")
    @Builder.Default
    private Integer xpReward = 100;

    @Column(name = "estimated_hours")
    @Builder.Default
    private Integer estimatedHours = 0;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "is_free")
    @Builder.Default
    private Boolean isFree = true;

    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal price = BigDecimal.ZERO;

    @Column(name = "max_enrollment")
    @Builder.Default
    private Integer maxEnrollment = 0;

    @Column(name = "total_enrolled")
    @Builder.Default
    private Integer totalEnrolled = 0;

    @Column(name = "total_modules")
    @Builder.Default
    private Integer totalModules = 0;

    @Column(name = "total_lessons")
    @Builder.Default
    private Integer totalLessons = 0;

    @Column(name = "total_duration_min")
    @Builder.Default
    private Integer totalDurationMin = 0;

    @Column(name = "avg_rating")
    @Builder.Default
    private Double avgRating = 0.0;

    @Column(name = "total_ratings")
    @Builder.Default
    private Integer totalRatings = 0;

    @Column(name = "total_reviews")
    @Builder.Default
    private Integer totalReviews = 0;

    @Column(name = "total_completions")
    @Builder.Default
    private Integer totalCompletions = 0;

    @Column(name = "completion_rate")
    @Builder.Default
    private Double completionRate = 0.0;

    @Convert(converter = JsonListConverter.class)
    @Column(columnDefinition = "JSON")
    private List<String> tags;

    @Convert(converter = JsonListConverter.class)
    @Column(columnDefinition = "JSON")
    private List<String> prerequisites;

    @Convert(converter = JsonListConverter.class)
    @Column(name = "learning_outcomes", columnDefinition = "JSON")
    private List<String> learningOutcomes;

    @Column(name = "target_audience", length = 500)
    private String targetAudience;

    @Column(name = "is_featured")
    @Builder.Default
    private Boolean isFeatured = false;

    @Column(name = "featured_order")
    @Builder.Default
    private Integer featuredOrder = 0;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Module> modules = new ArrayList<>();
}
