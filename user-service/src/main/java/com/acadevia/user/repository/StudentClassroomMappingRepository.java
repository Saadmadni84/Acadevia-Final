package com.acadevia.user.repository;

import com.acadevia.user.entity.StudentClassroomMapping;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface StudentClassroomMappingRepository extends JpaRepository<StudentClassroomMapping, Long> {
    List<StudentClassroomMapping> findByClassroomIdAndIsActiveTrue(Long classroomId);
    Optional<StudentClassroomMapping> findByStudentIdAndAcademicYearAndIsActiveTrue(
        Long studentId, String academicYear);
    Optional<StudentClassroomMapping> findByStudentSchoolIdAndSchoolIdAndAcademicYear(
        String studentSchoolId, Long schoolId, String academicYear);
    boolean existsByStudentSchoolIdAndSchoolIdAndAcademicYear(
        String studentSchoolId, Long schoolId, String academicYear);
    boolean existsByStudentIdAndClassroomIdAndAcademicYear(
        Long studentId, Long classroomId, String academicYear);

    @Query("SELECT COUNT(s) FROM StudentClassroomMapping s WHERE s.classroom.id = :classroomId AND s.isActive = true")
    Long countStudentsByClassroomId(@Param("classroomId") Long classroomId);

    @Query("SELECT s FROM StudentClassroomMapping s WHERE s.school.id = :schoolId AND s.isActive = true")
    Page<StudentClassroomMapping> findBySchoolId(@Param("schoolId") Long schoolId, Pageable pageable);
}
