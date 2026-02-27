package com.acadevia.course.repository;

import com.acadevia.course.entity.Course;
import com.acadevia.course.enums.Board;
import com.acadevia.course.enums.CourseStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

    Page<Course> findByStatusAndIsActiveTrueOrderByPublishedAtDesc(CourseStatus status, Pageable pageable);
    
    // Derived query methods as requested
    Page<Course> findByStatus(CourseStatus status, Pageable pageable);

    Page<Course> findByClassGradeAndStatusOrderByAvgRatingDesc(Integer classGrade, CourseStatus status, Pageable pageable);

    Page<Course> findBySubjectAndClassGradeAndStatus(String subject, Integer classGrade, CourseStatus status, Pageable pageable);

    Page<Course> findByCategoryAndClassGradeAndStatus(String category, Integer classGrade, CourseStatus status, Pageable pageable);

    Page<Course> findByBoardAndClassGradeAndStatus(Board board, Integer classGrade, CourseStatus status, Pageable pageable);

    Page<Course> findByLanguageAndClassGradeAndStatus(String language, Integer classGrade, CourseStatus status, Pageable pageable);

    Page<Course> findByClassGradeAndStatus(Integer classGrade, CourseStatus status, Pageable pageable);

    Page<Course> findBySubjectAndStatus(String subject, CourseStatus status, Pageable pageable);

    Page<Course> findByCategoryAndStatus(String category, CourseStatus status, Pageable pageable);

    Page<Course> findByBoardAndStatus(Board board, CourseStatus status, Pageable pageable);

    Page<Course> findByLanguageAndStatus(String language, CourseStatus status, Pageable pageable);

    Page<Course> findByTeacherIdOrderByCreatedAtDesc(Long teacherId, Pageable pageable);

    Page<Course> findByTeacherIdAndStatus(Long teacherId, CourseStatus status, Pageable pageable);

    Page<Course> findBySchoolIdAndStatus(Long schoolId, CourseStatus status, Pageable pageable);

    List<Course> findTop10ByStatusOrderByTotalEnrolledDesc(CourseStatus status);

    List<Course> findTop10ByStatusOrderByAvgRatingDesc(CourseStatus status);

    List<Course> findByIsFeaturedTrueAndStatusOrderByFeaturedOrderAsc(CourseStatus status);

    @Query("SELECT c FROM Course c WHERE c.status = 'PUBLISHED' AND " +
           "(LOWER(c.title) LIKE LOWER(CONCAT('%',:q,'%')) OR " +
           "LOWER(c.description) LIKE LOWER(CONCAT('%',:q,'%')) OR " +
           "LOWER(c.subject) LIKE LOWER(CONCAT('%',:q,'%')) OR " +
           "LOWER(c.category) LIKE LOWER(CONCAT('%',:q,'%')))")
    Page<Course> searchCourses(@Param("q") String query, Pageable pageable);

    @Query("SELECT c FROM Course c WHERE c.status = 'PUBLISHED' AND " +
           "c.classGrade = :grade AND c.language = :lang AND " +
           "(c.board = :board OR c.board = 'ALL')")
    Page<Course> findByGradeAndLanguageAndBoard(
            @Param("grade") Integer grade, @Param("lang") String language,
            @Param("board") Board board, Pageable pageable);

    @Query("SELECT c FROM Course c WHERE c.status = 'PUBLISHED' AND " +
           "c.classGrade = :grade AND c.subject = :subject AND " +
           "c.language IN :languages AND (c.board = :board OR c.board = 'ALL') " +
           "ORDER BY c.avgRating DESC")
    List<Course> findRecommendedCourses(
            @Param("grade") Integer grade, @Param("subject") String subject,
            @Param("languages") List<String> languages, @Param("board") Board board);

    @Query("SELECT COUNT(c) FROM Course c WHERE c.teacherId = :teacherId")
    Long countByTeacherId(@Param("teacherId") Long teacherId);

    @Query("SELECT COUNT(c) FROM Course c WHERE c.status = :status")
    Long countByStatus(@Param("status") CourseStatus status);

    @Modifying
    @Query("UPDATE Course c SET c.totalEnrolled = c.totalEnrolled + 1 WHERE c.id = :courseId")
    void incrementEnrollmentCount(@Param("courseId") Long courseId);

    @Modifying
    @Query("UPDATE Course c SET c.totalCompletions = c.totalCompletions + 1 WHERE c.id = :courseId")
    void incrementCompletionCount(@Param("courseId") Long courseId);

    @Modifying
    @Query("UPDATE Course c SET c.avgRating = :rating, c.totalRatings = :totalRatings, c.totalReviews = :totalReviews WHERE c.id = :courseId")
    void updateRating(@Param("courseId") Long courseId, @Param("rating") Double rating,
                      @Param("totalRatings") Integer totalRatings, @Param("totalReviews") Integer totalReviews);
}
