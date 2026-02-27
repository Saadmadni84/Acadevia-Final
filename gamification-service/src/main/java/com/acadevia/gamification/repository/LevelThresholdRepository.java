package com.acadevia.gamification.repository;

import com.acadevia.gamification.entity.LevelThreshold;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LevelThresholdRepository extends JpaRepository<LevelThreshold, Integer> {
    
    // Find highest level where minXp <= user's totalXp
    Optional<LevelThreshold> findTopByMinXpLessThanEqualOrderByLevelDesc(Long xp);
    
    // Find next level
    Optional<LevelThreshold> findTopByMinXpGreaterThanOrderByLevelAsc(Long xp);
}
