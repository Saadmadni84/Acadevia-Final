package com.acadevia.content.repository;

import com.acadevia.content.entity.VideoWatchProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VideoWatchProgressRepository extends JpaRepository<VideoWatchProgress, Long> {

    Optional<VideoWatchProgress> findByVideoIdAndUserId(Long videoId, Long userId);

    List<VideoWatchProgress> findByUserIdOrderByLastWatchedAtDesc(Long userId);

    @Query("SELECT wp FROM VideoWatchProgress wp WHERE wp.userId = :userId AND wp.isCompleted = true ORDER BY wp.completedAt DESC")
    List<VideoWatchProgress> findCompletedByUserId(@Param("userId") Long userId);

    @Query("SELECT wp FROM VideoWatchProgress wp WHERE wp.userId = :userId AND wp.isCompleted = false ORDER BY wp.lastWatchedAt DESC")
    List<VideoWatchProgress> findInProgressByUserId(@Param("userId") Long userId);

    @Query("SELECT wp FROM VideoWatchProgress wp JOIN Video v ON wp.videoId = v.id WHERE v.courseId = :courseId AND wp.userId = :userId")
    List<VideoWatchProgress> findByCourseIdAndUserId(@Param("courseId") Long courseId, @Param("userId") Long userId);

    @Query("SELECT wp FROM VideoWatchProgress wp JOIN Video v ON wp.videoId = v.id WHERE v.lessonId = :lessonId AND wp.userId = :userId")
    List<VideoWatchProgress> findByLessonIdAndUserId(@Param("lessonId") Long lessonId, @Param("userId") Long userId);

    @Query("SELECT AVG(wp.watchPercentage) FROM VideoWatchProgress wp JOIN Video v ON wp.videoId = v.id WHERE v.courseId = :courseId AND wp.userId = :userId")
    Double avgWatchPercentageByCourseAndUser(@Param("courseId") Long courseId, @Param("userId") Long userId);

    @Query("SELECT AVG(wp.watchPercentage) FROM VideoWatchProgress wp JOIN Video v ON wp.videoId = v.id WHERE v.lessonId = :lessonId AND wp.userId = :userId")
    Double avgWatchPercentageByLessonAndUser(@Param("lessonId") Long lessonId, @Param("userId") Long userId);

    @Query("SELECT COUNT(wp) FROM VideoWatchProgress wp JOIN Video v ON wp.videoId = v.id WHERE v.courseId = :courseId AND wp.userId = :userId AND wp.isCompleted = true")
    Long countCompletedByCourseAndUser(@Param("courseId") Long courseId, @Param("userId") Long userId);

    Boolean existsByVideoIdAndUserId(Long videoId, Long userId);

    @Query("SELECT AVG(wp.watchPercentage) FROM VideoWatchProgress wp WHERE wp.videoId = :videoId")
    Double avgWatchPercentageByVideoId(@Param("videoId") Long videoId);
}
