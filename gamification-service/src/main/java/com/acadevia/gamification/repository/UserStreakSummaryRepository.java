package com.acadevia.gamification.repository;

import com.acadevia.gamification.entity.UserStreakSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserStreakSummaryRepository extends JpaRepository<UserStreakSummary, String> {
}
