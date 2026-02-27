package com.acadevia.quiz.repository;

import com.acadevia.quiz.entity.Quiz;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long>, JpaSpecificationExecutor<Quiz> {
    
    Page<Quiz> findByCourseId(Long courseId, Pageable pageable);
    
    Page<Quiz> findBySubjectAndClassGrade(String subject, Integer classGrade, Pageable pageable);

    @Query("SELECT q FROM Quiz q WHERE q.subject = :subject AND q.classGrade = :classGrade AND q.quizType = 'DAILY'")
    Optional<Quiz> findDailyQuiz(String subject, Integer classGrade);

    Page<Quiz> findByCreatedBy(Long teacherId, Pageable pageable);
}
