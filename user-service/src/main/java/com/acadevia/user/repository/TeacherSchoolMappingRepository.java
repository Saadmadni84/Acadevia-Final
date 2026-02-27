package com.acadevia.user.repository;

import com.acadevia.user.entity.TeacherSchoolMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TeacherSchoolMappingRepository extends JpaRepository<TeacherSchoolMapping, Long> {
    List<TeacherSchoolMapping> findBySchoolIdAndIsActiveTrue(Long schoolId);
    List<TeacherSchoolMapping> findByTeacherIdAndIsActiveTrue(Long teacherId);
    Optional<TeacherSchoolMapping> findByTeacherIdAndSchoolId(Long teacherId, Long schoolId);
    boolean existsByTeacherIdAndSchoolIdAndIsActiveTrue(Long teacherId, Long schoolId);

    @Query("SELECT COUNT(t) FROM TeacherSchoolMapping t WHERE t.school.id = :schoolId AND t.isActive = true")
    Long countTeachersBySchoolId(@Param("schoolId") Long schoolId);
}
