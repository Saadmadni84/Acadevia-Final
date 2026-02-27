package com.acadevia.quiz.repository;

import com.acadevia.quiz.entity.DailyChallenge;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DailyChallengeRepository extends JpaRepository<DailyChallenge, Long> {
    
    Optional<DailyChallenge> findByChallengeDateAndClassGradeAndSubject(LocalDate date, Integer classGrade, String subject);
    
    @Query("SELECT dc FROM DailyChallenge dc WHERE dc.classGrade = :classGrade AND dc.subject = :subject ORDER BY dc.challengeDate DESC")
    List<DailyChallenge> findHistory(Integer classGrade, String subject, Pageable pageable);
}
