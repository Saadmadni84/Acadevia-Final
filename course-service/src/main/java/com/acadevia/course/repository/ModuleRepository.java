package com.acadevia.course.repository;

import com.acadevia.course.entity.Module;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ModuleRepository extends JpaRepository<Module, Long> {

    List<Module> findByCourseIdAndIsActiveTrueOrderBySequenceOrderAsc(Long courseId);

    Optional<Module> findByIdAndCourseId(Long id, Long courseId);

    @Query("SELECT COALESCE(MAX(m.sequenceOrder), 0) FROM Module m WHERE m.course.id = :courseId")
    Integer findMaxSequenceOrder(@Param("courseId") Long courseId);

    @Query("SELECT COUNT(m) FROM Module m WHERE m.course.id = :courseId AND m.isActive = true")
    Integer countByCourseId(@Param("courseId") Long courseId);

    @Modifying
    @Query("UPDATE Module m SET m.sequenceOrder = :newOrder WHERE m.id = :moduleId")
    void updateSequenceOrder(@Param("moduleId") Long moduleId, @Param("newOrder") Integer newOrder);
}
