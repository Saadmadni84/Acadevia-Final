package com.acadevia.course.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "modules", 
    uniqueConstraints = @UniqueConstraint(columnNames = {"course_id", "sequence_order"}),
    indexes = {
        @Index(name = "idx_module_course", columnList = "course_id"),
        @Index(name = "idx_module_active", columnList = "is_active")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Module {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "sequence_order", nullable = false)
    private Integer sequenceOrder;

    @Column(name = "total_lessons")
    @Builder.Default
    private Integer totalLessons = 0;

    @Column(name = "total_duration_min")
    @Builder.Default
    private Integer totalDurationMin = 0;

    @Column(name = "xp_reward")
    @Builder.Default
    private Integer xpReward = 20;

    @Column(name = "is_free_preview")
    @Builder.Default
    private Boolean isFreePreview = false;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "module", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sequenceOrder ASC")
    @Builder.Default
    private List<Lesson> lessons = new ArrayList<>();
}
