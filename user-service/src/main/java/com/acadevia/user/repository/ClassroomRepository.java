package com.acadevia.user.repository;

import com.acadevia.user.entity.Classroom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ClassroomRepository extends JpaRepository<Classroom, Long> {
    List<Classroom> findBySchoolIdAndIsActiveTrueOrderByClassGradeAscSectionAsc(Long schoolId);
    List<Classroom> findBySchoolIdAndClassGradeAndIsActiveTrue(Long schoolId, Integer classGrade);
    List<Classroom> findBySchoolIdAndAcademicYearAndIsActiveTrue(Long schoolId, String academicYear);
    Optional<Classroom> findBySchoolIdAndClassGradeAndSectionAndAcademicYear(
        Long schoolId, Integer classGrade, String section, String academicYear);

    @Query("SELECT COUNT(c) FROM Classroom c WHERE c.school.id = :schoolId AND c.isActive = true")
    Long countBySchoolId(@Param("schoolId") Long schoolId);

    @Modifying
    @Query("UPDATE Classroom c SET c.currentStudents = c.currentStudents + 1 WHERE c.id = :classroomId")
    void incrementStudentCount(@Param("classroomId") Long classroomId);
}
