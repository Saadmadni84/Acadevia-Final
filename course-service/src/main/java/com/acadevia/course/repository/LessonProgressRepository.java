package com.acadevia.course.repository;

import com.acadevia.course.entity.LessonProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LessonProgressRepository extends JpaRepository<LessonProgress, Long> {

    Optional<LessonProgress> findByUserIdAndLessonId(Long userId, Long lessonId);

    List<LessonProgress> findByUserIdAndCourseId(Long userId, Long courseId);

    List<LessonProgress> findByUserIdAndCourseIdAndIsCompletedTrue(Long userId, Long courseId);

    List<LessonProgress> findByUserIdAndModuleId(Long userId, Long moduleId);

    @Query("SELECT COUNT(lp) FROM LessonProgress lp WHERE lp.userId = :userId AND lp.courseId = :courseId AND lp.isCompleted = true")
    Integer countCompletedByUserAndCourse(@Param("userId") Long userId, @Param("courseId") Long courseId);

    @Query("SELECT COALESCE(SUM(lp.timeSpentSec), 0) FROM LessonProgress lp WHERE lp.userId = :userId AND lp.courseId = :courseId")
    Long sumTimeSpentByUserAndCourse(@Param("userId") Long userId, @Param("courseId") Long courseId);

    boolean existsByUserIdAndLessonIdAndIsCompletedTrue(Long userId, Long lessonId);
}
