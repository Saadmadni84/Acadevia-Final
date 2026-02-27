package com.acadevia.course.repository;

import com.acadevia.course.entity.CourseReview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseReviewRepository extends JpaRepository<CourseReview, Long> {

    Page<CourseReview> findByCourseIdAndIsVisibleTrueOrderByCreatedAtDesc(Long courseId, Pageable pageable);

    Optional<CourseReview> findByUserIdAndCourseId(Long userId, Long courseId);

    boolean existsByUserIdAndCourseId(Long userId, Long courseId);

    @Query("SELECT COALESCE(AVG(r.rating), 0.0) FROM CourseReview r WHERE r.courseId = :courseId AND r.isVisible = true")
    Double avgRatingByCourseId(@Param("courseId") Long courseId);

    @Query("SELECT COUNT(r) FROM CourseReview r WHERE r.courseId = :courseId AND r.isVisible = true")
    Integer countByCourseId(@Param("courseId") Long courseId);

    @Query("SELECT r.rating, COUNT(r) FROM CourseReview r WHERE r.courseId = :courseId AND r.isVisible = true GROUP BY r.rating ORDER BY r.rating DESC")
    List<Object[]> getRatingDistribution(@Param("courseId") Long courseId);
}
