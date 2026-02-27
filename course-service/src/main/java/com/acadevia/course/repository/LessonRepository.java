package com.acadevia.course.repository;

import com.acadevia.course.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {

    List<Lesson> findByModuleIdAndIsActiveTrueOrderBySequenceOrderAsc(Long moduleId);

    List<Lesson> findByCourseIdAndIsActiveTrueOrderBySequenceOrderAsc(Long courseId);

    Optional<Lesson> findByIdAndModuleId(Long id, Long moduleId);

    Optional<Lesson> findByIdAndCourseId(Long id, Long courseId);

    @Query("SELECT COALESCE(MAX(l.sequenceOrder), 0) FROM Lesson l WHERE l.module.id = :moduleId")
    Integer findMaxSequenceOrder(@Param("moduleId") Long moduleId);

    @Query("SELECT COUNT(l) FROM Lesson l WHERE l.courseId = :courseId AND l.isActive = true")
    Integer countByCourseId(@Param("courseId") Long courseId);

    @Query("SELECT COUNT(l) FROM Lesson l WHERE l.module.id = :moduleId AND l.isActive = true")
    Integer countByModuleId(@Param("moduleId") Long moduleId);

    @Query("SELECT COUNT(l) FROM Lesson l WHERE l.courseId = :courseId AND l.isActive = true AND l.isMandatory = true")
    Integer countMandatoryByCourseId(@Param("courseId") Long courseId);

    @Query("SELECT COALESCE(SUM(l.durationMinutes), 0) FROM Lesson l WHERE l.courseId = :courseId AND l.isActive = true")
    Integer sumDurationByCourseId(@Param("courseId") Long courseId);
}
