package com.acadevia.content.repository;

import com.acadevia.content.entity.VideoPopQuestion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VideoPopQuestionRepository extends JpaRepository<VideoPopQuestion, Long> {

    List<VideoPopQuestion> findByVideoIdAndIsActiveTrueOrderBySequenceOrder(Long videoId);

    Page<VideoPopQuestion> findByVideoIdAndIsActiveTrue(Long videoId, Pageable pageable);

    @Query("SELECT q FROM VideoPopQuestion q WHERE q.videoId = :videoId AND q.timestampSec >= :startSec AND q.timestampSec <= :endSec AND q.isActive = true ORDER BY q.timestampSec")
    List<VideoPopQuestion> findByVideoIdAndTimestampRange(@Param("videoId") Long videoId, @Param("startSec") Integer startSec, @Param("endSec") Integer endSec);

    @Query("SELECT q FROM VideoPopQuestion q WHERE q.videoId = :videoId AND q.topic = :topic AND q.isActive = true")
    List<VideoPopQuestion> findByVideoIdAndTopic(@Param("videoId") Long videoId, @Param("topic") String topic);

    @Query("SELECT q FROM VideoPopQuestion q WHERE q.videoId = :videoId AND q.difficulty = :difficulty AND q.isActive = true")
    List<VideoPopQuestion> findByVideoIdAndDifficulty(@Param("videoId") Long videoId, @Param("difficulty") com.acadevia.content.entity.enums.Difficulty difficulty);

    Long countByVideoIdAndIsActiveTrue(Long videoId);

    @Query("SELECT MAX(q.sequenceOrder) FROM VideoPopQuestion q WHERE q.videoId = :videoId")
    Integer findMaxSequenceOrderByVideoId(@Param("videoId") Long videoId);

    @Modifying
    @Query("UPDATE VideoPopQuestion q SET q.totalAttempts = q.totalAttempts + 1 WHERE q.id = :questionId")
    void incrementTotalAttempts(@Param("questionId") Long questionId);

    @Modifying
    @Query("UPDATE VideoPopQuestion q SET q.correctCount = q.correctCount + 1 WHERE q.id = :questionId")
    void incrementCorrectAttempts(@Param("questionId") Long questionId);

    @Modifying
    @Query("UPDATE VideoPopQuestion q SET q.accuracyPct = CASE WHEN q.totalAttempts > 0 THEN (q.correctCount * 100.0 / q.totalAttempts) ELSE 0 END WHERE q.id = :questionId")
    void updateAccuracyRate(@Param("questionId") Long questionId);

    @Query("SELECT q FROM VideoPopQuestion q JOIN q.video v WHERE v.courseId = :courseId AND q.isActive = true ORDER BY q.videoId, q.sequenceOrder")
    List<VideoPopQuestion> findByCourseId(@Param("courseId") Long courseId);
}
