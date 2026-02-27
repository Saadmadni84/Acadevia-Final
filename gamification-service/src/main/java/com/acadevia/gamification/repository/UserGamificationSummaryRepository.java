package com.acadevia.gamification.repository;

import com.acadevia.gamification.entity.UserGamificationSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserGamificationSummaryRepository extends JpaRepository<UserGamificationSummary, String> {
}
