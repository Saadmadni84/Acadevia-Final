package com.acadevia.admin.service;

import com.acadevia.admin.dto.kafka.RuleUpdatedEvent;
import com.acadevia.admin.dto.request.GamificationRuleRequest;
import com.acadevia.admin.dto.response.GamificationRuleResponse;
import com.acadevia.admin.entity.GamificationRule;
import com.acadevia.admin.enums.AuditAction;
import com.acadevia.admin.enums.RuleType;
import com.acadevia.admin.kafka.producer.AdminEventProducer;
import com.acadevia.admin.repository.GamificationRuleRepository;
import com.acadevia.admin.util.Constants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GamificationConfigServiceImpl implements GamificationConfigService {

    private final GamificationRuleRepository ruleRepo;
    private final AuditService auditService;
    private final AdminEventProducer eventProducer;

    @Override
    @Cacheable(value = "gamificationRules", key = "'all'")
    public List<GamificationRuleResponse> getAllRules() {
        return ruleRepo.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public GamificationRuleResponse getRule(RuleType ruleType) {
        return ruleRepo.findByRuleType(ruleType).map(this::toResponse)
                .orElseThrow(() -> new RuntimeException("Rule not found: " + ruleType));
    }

    @Override
    @Transactional
    @CacheEvict(value = "gamificationRules", allEntries = true)
    public GamificationRuleResponse updateRule(GamificationRuleRequest request, Long adminUserId) {
        GamificationRule rule = ruleRepo.findByRuleType(request.getRuleType())
                .orElseGet(() -> GamificationRule.builder()
                        .ruleType(request.getRuleType())
                        .build());

        Integer oldValue = rule.getValue();

        rule.setValue(request.getValue());
        if (request.getMinValue() != null) rule.setMinValue(request.getMinValue());
        if (request.getMaxValue() != null) rule.setMaxValue(request.getMaxValue());
        if (request.getIsActive() != null) rule.setIsActive(request.getIsActive());
        if (request.getConfigJson() != null) rule.setConfigJson(request.getConfigJson());
        if (request.getDescription() != null) rule.setDescription(request.getDescription());
        rule.setUpdatedBy(adminUserId);

        rule = ruleRepo.save(rule);

        // Audit
        auditService.log(adminUserId, null, AuditAction.XP_RULE_UPDATED,
                "GAMIFICATION_RULE", rule.getId(),
                "Updated " + request.getRuleType() + " from " + oldValue + " to " + request.getValue(),
                null, null, null, null);

        // Publish event
        eventProducer.publishRuleUpdated(RuleUpdatedEvent.builder()
                .ruleType(request.getRuleType().name())
                .oldValue(oldValue)
                .newValue(request.getValue())
                .updatedBy(adminUserId)
                .timestamp(LocalDateTime.now())
                .build());

        log.info("Gamification rule updated: {} = {} (by admin: {})",
                request.getRuleType(), request.getValue(), adminUserId);

        return toResponse(rule);
    }

    @Override
    @EventListener(ApplicationReadyEvent.class)
    public void initializeDefaultRules() {
        if (ruleRepo.count() > 0) return;

        log.info("Initializing default gamification rules...");

        List<GamificationRule> defaults = List.of(
                createDefault(RuleType.XP_QUIZ, "Quiz Completion XP", 50, 10, 200),
                createDefault(RuleType.XP_COURSE, "Course Completion XP", 200, 50, 500),
                createDefault(RuleType.XP_GAME, "Game Completion XP", 50, 10, 150),
                createDefault(RuleType.XP_STREAK, "Daily Streak XP", 10, 5, 50),
                createDefault(RuleType.XP_VIDEO, "Video Completion XP", 20, 5, 100),
                createDefault(RuleType.XP_POPUP, "Video Pop-up XP", 10, 5, 30),
                createDefault(RuleType.XP_MULTIPLAYER, "Multiplayer Win XP", 100, 50, 300),
                createDefault(RuleType.XP_CHALLENGE, "Challenge Participation XP", 30, 10, 100),
                createDefault(RuleType.ADAPTIVE_ACCURACY, "Adaptive Target Accuracy %", 75, 60, 90),
                createDefault(RuleType.ADAPTIVE_WIN_RATE, "Adaptive Win Rate %", 75, 60, 85),
                createDefault(RuleType.WALLET_XP_RATIO, "XP to Coin Ratio", 10, 5, 20)
        );

        ruleRepo.saveAll(defaults);
        log.info("Initialized {} default gamification rules", defaults.size());
    }

    private GamificationRule createDefault(RuleType type, String name, int value, int min, int max) {
        return GamificationRule.builder()
                .ruleType(type)
                .displayName(name)
                .value(value)
                .minValue(min)
                .maxValue(max)
                .isActive(true)
                .build();
    }

    private GamificationRuleResponse toResponse(GamificationRule r) {
        return GamificationRuleResponse.builder()
                .id(r.getId())
                .ruleType(r.getRuleType())
                .displayName(r.getDisplayName())
                .description(r.getDescription())
                .value(r.getValue())
                .minValue(r.getMinValue())
                .maxValue(r.getMaxValue())
                .isActive(r.getIsActive())
                .configJson(r.getConfigJson())
                .updatedAt(r.getUpdatedAt())
                .build();
    }
}
