package com.acadevia.user.repository;

import com.acadevia.user.entity.TeacherClassroomMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TeacherClassroomMappingRepository extends JpaRepository<TeacherClassroomMapping, Long> {
    List<TeacherClassroomMapping> findByClassroomIdAndIsActiveTrue(Long classroomId);
    List<TeacherClassroomMapping> findByTeacherIdAndIsActiveTrue(Long teacherId);
    List<TeacherClassroomMapping> findByTeacherIdAndSchoolIdAndIsActiveTrue(Long teacherId, Long schoolId);
    Optional<TeacherClassroomMapping> findByTeacherIdAndClassroomIdAndSubject(
        Long teacherId, Long classroomId, String subject);
    boolean existsByTeacherIdAndClassroomIdAndSubjectAndIsActiveTrue(
        Long teacherId, Long classroomId, String subject);

    @Query("SELECT DISTINCT t.teacherId FROM TeacherClassroomMapping t " +
           "WHERE t.classroom.id = :classroomId AND t.isActive = true")
    List<Long> findTeacherIdsByClassroomId(@Param("classroomId") Long classroomId);
}
