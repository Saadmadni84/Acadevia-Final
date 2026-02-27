package com.acadevia.course.repository;

import com.acadevia.course.entity.Enrollment;
import com.acadevia.course.enums.EnrollmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    Optional<Enrollment> findByUserIdAndCourseId(Long userId, Long courseId);

    boolean existsByUserIdAndCourseId(Long userId, Long courseId);

    Page<Enrollment> findByUserIdAndStatusOrderByLastAccessedAtDesc(Long userId, EnrollmentStatus status, Pageable pageable);

    Page<Enrollment> findByUserIdOrderByLastAccessedAtDesc(Long userId, Pageable pageable);

    List<Enrollment> findByUserIdAndStatusIn(Long userId, List<EnrollmentStatus> statuses);

    Page<Enrollment> findByCourseIdOrderByEnrolledAtDesc(Long courseId, Pageable pageable);

    @Query("SELECT COUNT(e) FROM Enrollment e WHERE e.userId = :userId AND e.status = 'ACTIVE'")
    Long countActiveByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(e) FROM Enrollment e WHERE e.userId = :userId AND e.status = 'COMPLETED'")
    Long countCompletedByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(e) FROM Enrollment e WHERE e.course.id = :courseId")
    Long countByCourseId(@Param("courseId") Long courseId);

    @Query("SELECT COALESCE(AVG(e.progressPct), 0.0) FROM Enrollment e WHERE e.course.id = :courseId AND e.status = 'ACTIVE'")
    Double avgProgressByCourseId(@Param("courseId") Long courseId);
}
