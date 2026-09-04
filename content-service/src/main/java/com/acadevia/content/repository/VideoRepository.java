package com.acadevia.content.repository;

import com.acadevia.content.entity.Video;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VideoRepository extends JpaRepository<Video, Long> {

    List<Video> findByLessonIdAndIsActiveTrue(Long lessonId);

    List<Video> findByCourseIdAndIsActiveTrue(Long courseId);

    List<Video> findByModuleIdAndIsActiveTrue(Long moduleId);

    Page<Video> findByModuleIdAndIsActiveTrue(Long moduleId, Pageable pageable);

    List<Video> findByClassGradeAndSubjectIgnoreCaseAndChapterIgnoreCaseAndIsActiveTrue(Integer classGrade, String subject, String chapter);

    Page<Video> findByClassGradeAndSubjectIgnoreCaseAndChapterIgnoreCaseAndIsActiveTrue(Integer classGrade, String subject, String chapter, Pageable pageable);

    Page<Video> findByIsActiveTrue(Pageable pageable);

    Page<Video> findByCreatedByAndIsActiveTrue(Long createdBy, Pageable pageable);

    Page<Video> findBySchoolIdAndIsActiveTrue(Long schoolId, Pageable pageable);

    Optional<Video> findByIdAndIsActiveTrue(Long id);

    @Query("SELECT v FROM Video v WHERE v.courseId = :courseId AND v.isActive = true ORDER BY v.moduleId, v.lessonId")
    List<Video> findByCourseIdOrderByModuleAndLesson(@Param("courseId") Long courseId);

    @Query("SELECT v FROM Video v WHERE v.lessonId IN :lessonIds AND v.isActive = true")
    List<Video> findByLessonIdIn(@Param("lessonIds") List<Long> lessonIds);

    @Query("SELECT COUNT(v) FROM Video v WHERE v.courseId = :courseId AND v.isActive = true")
    Long countByCourseId(@Param("courseId") Long courseId);

    @Query("SELECT COUNT(v) FROM Video v WHERE v.lessonId = :lessonId AND v.isActive = true")
    Long countByLessonId(@Param("lessonId") Long lessonId);

    @Query("SELECT SUM(v.durationSeconds) FROM Video v WHERE v.courseId = :courseId AND v.isActive = true")
    Long sumDurationByCourseId(@Param("courseId") Long courseId);

    @Query("SELECT SUM(v.durationSeconds) FROM Video v WHERE v.lessonId = :lessonId AND v.isActive = true")
    Long sumDurationByLessonId(@Param("lessonId") Long lessonId);

    @Modifying
    @Query("UPDATE Video v SET v.totalViews = v.totalViews + 1 WHERE v.id = :videoId")
    void incrementTotalViews(@Param("videoId") Long videoId);

    @Modifying
    @Query("UPDATE Video v SET v.uniqueViewers = v.uniqueViewers + 1 WHERE v.id = :videoId")
    void incrementUniqueViewers(@Param("videoId") Long videoId);

    @Modifying
    @Query("UPDATE Video v SET v.totalPopQuestions = :count WHERE v.id = :videoId")
    void updateTotalPopQuestions(@Param("videoId") Long videoId, @Param("count") Integer count);

    @Modifying
    @Query("UPDATE Video v SET v.totalDownloads = v.totalDownloads + 1 WHERE v.id = :videoId")
    void incrementTotalDownloads(@Param("videoId") Long videoId);

    @Modifying
    @Query("UPDATE Video v SET v.totalBookmarks = v.totalBookmarks + 1 WHERE v.id = :videoId")
    void incrementTotalBookmarks(@Param("videoId") Long videoId);

    @Modifying
    @Query("UPDATE Video v SET v.totalBookmarks = v.totalBookmarks - 1 WHERE v.id = :videoId AND v.totalBookmarks > 0")
    void decrementTotalBookmarks(@Param("videoId") Long videoId);

    @Modifying
    @Query("UPDATE Video v SET v.totalNotes = v.totalNotes + 1 WHERE v.id = :videoId")
    void incrementTotalNotes(@Param("videoId") Long videoId);

    @Modifying
    @Query("UPDATE Video v SET v.totalNotes = v.totalNotes - 1 WHERE v.id = :videoId AND v.totalNotes > 0")
    void decrementTotalNotes(@Param("videoId") Long videoId);

    List<Video> findByIdIn(List<Long> ids);

    Page<Video> findByLessonIdAndIsActiveTrue(Long lessonId, Pageable pageable);

    Page<Video> findByCourseIdAndIsActiveTrue(Long courseId, Pageable pageable);

    @Query("SELECT v FROM Video v WHERE v.isActive = true AND (LOWER(v.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(v.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Video> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT v FROM Video v WHERE v.languageCode = :languageCode AND v.isActive = true")
    Page<Video> findByLanguageCode(@Param("languageCode") String languageCode, Pageable pageable);

    List<Video> findByCreatedByAndIsActiveTrueOrderByCreatedAtDesc(Long createdBy);

    List<Video> findByIsActiveTrueOrderByCreatedAtDesc();
}
