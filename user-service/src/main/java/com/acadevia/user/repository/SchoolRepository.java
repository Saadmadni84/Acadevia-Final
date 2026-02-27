package com.acadevia.user.repository;

import com.acadevia.user.entity.School;
import com.acadevia.user.entity.enums.Board;
import com.acadevia.user.entity.enums.Medium;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface SchoolRepository extends JpaRepository<School, Long> {
    Page<School> findByCityIdAndIsActiveTrue(Long cityId, Pageable pageable);
    Page<School> findByStateIdAndIsActiveTrue(Long stateId, Pageable pageable);
    Optional<School> findByCode(String code);
    Optional<School> findByUdiseCode(String udiseCode);
    Page<School> findByCityIdAndBoardAndIsActiveTrue(Long cityId, Board board, Pageable pageable);
    Page<School> findByCityIdAndMediumAndIsActiveTrue(Long cityId, Medium medium, Pageable pageable);

    @Query("SELECT s FROM School s WHERE s.city.id = :cityId AND s.isActive = true AND " +
           "(LOWER(s.name) LIKE LOWER(CONCAT('%',:query,'%')) OR " +
           "LOWER(s.nameLocal) LIKE LOWER(CONCAT('%',:query,'%')) OR " +
           "s.code LIKE CONCAT('%',:query,'%') OR " +
           "s.udiseCode LIKE CONCAT('%',:query,'%'))")
    Page<School> searchSchoolsInCity(@Param("cityId") Long cityId, @Param("query") String query, Pageable pageable);

    @Query("SELECT s FROM School s WHERE s.isActive = true AND " +
           "(LOWER(s.name) LIKE LOWER(CONCAT('%',:query,'%')) OR s.code LIKE CONCAT('%',:query,'%'))")
    Page<School> searchSchools(@Param("query") String query, Pageable pageable);

    @Query("SELECT COUNT(s) FROM School s WHERE s.city.id = :cityId AND s.isActive = true")
    Long countByCityId(@Param("cityId") Long cityId);

    @Query("SELECT COUNT(s) FROM School s WHERE s.state.id = :stateId AND s.isActive = true")
    Long countByStateId(@Param("stateId") Long stateId);

    @Modifying
    @Query("UPDATE School s SET s.totalStudents = s.totalStudents + 1 WHERE s.id = :schoolId")
    void incrementStudentCount(@Param("schoolId") Long schoolId);

    @Modifying
    @Query("UPDATE School s SET s.totalTeachers = s.totalTeachers + 1 WHERE s.id = :schoolId")
    void incrementTeacherCount(@Param("schoolId") Long schoolId);
}
