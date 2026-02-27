package com.acadevia.content.repository;

import com.acadevia.content.entity.VideoPopResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VideoPopResponseRepository extends JpaRepository<VideoPopResponse, Long> {

    List<VideoPopResponse> findByPopQuestionIdAndUserId(Long popQuestionId, Long userId);

    Optional<VideoPopResponse> findFirstByPopQuestionIdAndUserIdOrderByAttemptNumberDesc(Long popQuestionId, Long userId);

    @Query("SELECT COUNT(r) FROM VideoPopResponse r WHERE r.popQuestionId = :questionId AND r.userId = :userId")
    Integer countAttemptsByQuestionAndUser(@Param("questionId") Long questionId, @Param("userId") Long userId);

    @Query("SELECT r FROM VideoPopResponse r WHERE r.popQuestion.video.id = :videoId AND r.userId = :userId ORDER BY r.answeredAt")
    List<VideoPopResponse> findByVideoIdAndUserId(@Param("videoId") Long videoId, @Param("userId") Long userId);

    @Query("SELECT COUNT(r) FROM VideoPopResponse r WHERE r.popQuestion.video.id = :videoId AND r.userId = :userId AND r.isCorrect = true")
    Integer countCorrectByVideoIdAndUserId(@Param("videoId") Long videoId, @Param("userId") Long userId);

    @Query("SELECT COUNT(DISTINCT r.popQuestionId) FROM VideoPopResponse r WHERE r.popQuestion.video.id = :videoId AND r.userId = :userId")
    Integer countDistinctQuestionsAnsweredByVideoIdAndUserId(@Param("videoId") Long videoId, @Param("userId") Long userId);

    @Query("SELECT AVG(r.timeTakenSec) FROM VideoPopResponse r WHERE r.popQuestionId = :questionId")
    Double avgTimeTakenByQuestionId(@Param("questionId") Long questionId);

    @Query("SELECT SUM(r.xpEarned) FROM VideoPopResponse r WHERE r.popQuestion.video.id = :videoId AND r.userId = :userId")
    Integer sumXpEarnedByVideoIdAndUserId(@Param("videoId") Long videoId, @Param("userId") Long userId);

    Boolean existsByPopQuestionIdAndUserId(Long popQuestionId, Long userId);
}
