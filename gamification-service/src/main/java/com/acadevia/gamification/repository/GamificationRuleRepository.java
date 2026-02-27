package com.acadevia.gamification.repository;

import com.acadevia.gamification.entity.GamificationRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface GamificationRuleRepository extends JpaRepository<GamificationRule, UUID> {
    Optional<GamificationRule> findByRuleName(String ruleName);
    Optional<GamificationRule> findByActionType(String actionType);
}
