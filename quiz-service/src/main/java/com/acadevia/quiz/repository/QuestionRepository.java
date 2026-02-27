package com.acadevia.quiz.repository;

import com.acadevia.quiz.entity.Question;
import com.acadevia.quiz.entity.enums.DifficultyLevel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long>, JpaSpecificationExecutor<Question> {
    
    List<Question> findByQuizIdOrderBySequenceOrderAsc(Long quizId);
    
    @Query(value = "SELECT * FROM questions q WHERE " +
            "q.subject = :subject AND " +
            "(q.topic = :topic OR q.concept LIKE CONCAT('%', :topic, '%')) AND " +
            "q.class_grade = :classGrade AND " +
            "q.difficulty_level = :#{#difficulty.name()} AND " +
            "q.is_active = true AND " +
            "q.is_bank_question = true " +
            "ORDER BY RAND() LIMIT :count", nativeQuery = true)
    List<Question> findAdaptiveQuestions(@Param("subject") String subject,
                                         @Param("topic") String topic,
                                         @Param("classGrade") Integer classGrade,
                                         @Param("difficulty") DifficultyLevel difficulty,
                                         @Param("count") int count);
    
    @Query(value = "SELECT * FROM questions q WHERE " +
             "q.subject = :subject AND " +
             "q.class_grade = :classGrade AND " +
             "q.is_active = true AND " +
             "q.is_bank_question = true " +
             "ORDER BY RAND() LIMIT :count", nativeQuery = true)
    List<Question> findRandomQuestionsForDailyChallenge(@Param("subject") String subject,
                                                        @Param("classGrade") Integer classGrade,
                                                        @Param("count") int count);

    List<Question> findBySubjectAndTopicAndDifficultyLevel(String subject, String topic, DifficultyLevel difficultyLevel);
    
    Page<Question> findByQuizId(Long quizId, Pageable pageable);

    @Query("SELECT q FROM Question q WHERE (:subject IS NULL OR q.subject = :subject) AND (:topic IS NULL OR q.topic = :topic) AND q.isBankQuestion = true")
    Page<Question> findBankQuestions(@Param("subject") String subject, @Param("topic") String topic, Pageable pageable);
}
