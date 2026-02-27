package com.acadevia.quiz.repository;

import com.acadevia.quiz.entity.UserTopicAccuracy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserTopicAccuracyRepository extends JpaRepository<UserTopicAccuracy, Long> {
    
    Optional<UserTopicAccuracy> findByUserIdAndSubjectAndTopicAndClassGrade(Long userId, String subject, String topic, Integer classGrade);
    
    List<UserTopicAccuracy> findByUserIdAndClassGrade(Long userId, Integer classGrade);
    
    @Query("SELECT uta FROM UserTopicAccuracy uta WHERE uta.userId = :userId AND uta.classGrade = :classGrade ORDER BY uta.accuracyPercentage ASC")
    List<UserTopicAccuracy> findWeakTopics(Long userId, Integer classGrade, org.springframework.data.domain.Pageable pageable);
    
    @Query("SELECT uta FROM UserTopicAccuracy uta WHERE uta.userId = :userId AND uta.classGrade = :classGrade ORDER BY uta.accuracyPercentage DESC")
    List<UserTopicAccuracy> findStrongTopics(Long userId, Integer classGrade, org.springframework.data.domain.Pageable pageable);
}
