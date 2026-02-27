package com.acadevia.gamification.repository;

import com.acadevia.gamification.entity.DailyStreak;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DailyStreakRepository extends JpaRepository<DailyStreak, UUID> {
    
    // Find last activity for streak calculation
    Optional<DailyStreak> findTopByUserIdOrderByActivityDateDesc(String userId);
    
    // Check if user already has an activity tracked today
    boolean existsByUserIdAndActivityDate(String userId, LocalDate date);
}
