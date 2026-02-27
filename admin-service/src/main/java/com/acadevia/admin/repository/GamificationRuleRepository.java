package com.acadevia.admin.repository;
import com.acadevia.admin.entity.GamificationRule;
import com.acadevia.admin.enums.RuleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
@Repository
public interface GamificationRuleRepository extends JpaRepository<GamificationRule, Long> {
    Optional<GamificationRule> findByRuleType(RuleType ruleType);
    List<GamificationRule> findByIsActiveTrue();
}
