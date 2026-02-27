package com.acadevia.quiz.repository;

import com.acadevia.quiz.entity.QuizAttempt;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {
    
    List<QuizAttempt> findByQuizIdAndUserId(Long quizId, Long userId);
    
    Page<QuizAttempt> findByUserId(Long userId, Pageable pageable);
    
    @Query("SELECT COUNT(qa) FROM QuizAttempt qa WHERE qa.quizId = :quizId AND qa.userId = :userId")
    int countByQuizIdAndUserId(Long quizId, Long userId);
    
    @Query("SELECT qa FROM QuizAttempt qa WHERE qa.userId = :userId AND qa.status = 'IN_PROGRESS'")
    List<QuizAttempt> findInProgressAttempts(Long userId);

    @Query(value = "SELECT * FROM quiz_attempts qa WHERE qa.status = 'IN_PROGRESS' AND TIMESTAMPADD(SECOND, qa.time_limit_seconds, qa.started_at) < NOW()", nativeQuery = true)
    List<QuizAttempt> findExpiredAttempts();
}
