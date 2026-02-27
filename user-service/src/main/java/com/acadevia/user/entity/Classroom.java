package com.acadevia.user.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import jakarta.persistence.EntityListeners;

import java.time.LocalDateTime;

@Entity
@Table(name = "classrooms", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"school_id", "class_grade", "section", "academic_year"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Classroom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id", nullable = false)
    private School school;

    @Column(name = "class_grade", nullable = false)
    private Integer classGrade;

    @Column(nullable = false, length = 10)
    @Builder.Default
    private String section = "A";

    @Column(name = "academic_year", nullable = false, length = 10)
    private String academicYear;

    @Column(name = "class_teacher_id")
    private Long classTeacherId;

    @Column(name = "max_students")
    @Builder.Default
    private Integer maxStudents = 60;

    @Column(name = "current_students")
    @Builder.Default
    private Integer currentStudents = 0;

    @Column(name = "room_number", length = 20)
    private String roomNumber;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
