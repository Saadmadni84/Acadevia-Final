package com.acadevia.gamification.service;

import com.acadevia.gamification.config.KafkaConfig;
import com.acadevia.gamification.entity.GamificationRule;
import com.acadevia.gamification.entity.LevelThreshold;
import com.acadevia.gamification.entity.UserGamificationSummary;
import com.acadevia.gamification.entity.XpTransaction;
import com.acadevia.gamification.repository.GamificationRuleRepository;
import com.acadevia.gamification.repository.LevelThresholdRepository;
import com.acadevia.gamification.repository.UserGamificationSummaryRepository;
import com.acadevia.gamification.repository.XpTransactionRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class XpService {

    private final XpTransactionRepository xpTransactionRepository;
    private final GamificationRuleRepository ruleRepository;
    private final UserGamificationSummaryRepository summaryRepository;
    private final LevelThresholdRepository levelRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    @Transactional
    public void processAction(String userId, String actionType, String sourceId, Map<String, Object> metadata) {
        log.info("Processing XP action: {} for user: {}", actionType, userId);

        // 1. Find Rule
        Optional<GamificationRule> ruleOpt = ruleRepository.findByActionType(actionType);
        if (ruleOpt.isEmpty()) {
            return; // No rule for this action
        }
        GamificationRule rule = ruleOpt.get();

        if (!rule.getIsActive()) return;

        // 2. Check Limits
        if (rule.getMaxPerDay() > 0) {
            LocalDateTime startOfDay = LocalDateTime.now().toLocalDate().atStartOfDay();
            LocalDateTime endOfDay = startOfDay.plusDays(1);
            long count = xpTransactionRepository.countByUserIdAndActionTypeAndCreatedAtBetween(userId, actionType, startOfDay, endOfDay);
            if (count >= rule.getMaxPerDay()) {
                log.info("Daily limit reached for rule {} user {}", rule.getRuleName(), userId);
                return;
            }
        }

        // 3. Award XP
        int xpAmount = rule.getXpValue();
        
        // Handle metadata specific logic (e.g., perfect score bonus)
        if ("QUIZ_COMPLETE".equals(actionType) && metadata != null) {
             Integer score = (Integer) metadata.get("score");
             if (score != null && score == 100) {
                 xpAmount += 50; // Hardcoded bonus for example, usually use rules
             }
        }

        awardXp(userId, xpAmount, actionType, sourceId, metadata);
    }
    
    @Transactional
    public void awardXp(String userId, int amount, String actionType, String sourceId, Map<String, Object> metadata) {
        // Create Transaction
        String metadataJson = "{}";
        try {
            if (metadata != null) metadataJson = objectMapper.writeValueAsString(metadata);
        } catch (JsonProcessingException e) {
            log.error("Error serializing metadata", e);
        }

        XpTransaction tx = XpTransaction.builder()
                .userId(userId)
                .amount(amount)
                .actionType(actionType)
                .sourceId(sourceId)
                .metadata(metadataJson)
                .build();
        xpTransactionRepository.save(tx);

        // Update Summary
        UserGamificationSummary summary = summaryRepository.findById(userId)
                .orElse(UserGamificationSummary.builder().userId(userId).build());
        
        long oldTotal = summary.getTotalXp();
        summary.setTotalXp(oldTotal + amount);
        
        // Check Level Up
        checkLevelUp(summary);
        
        summaryRepository.save(summary);
        
        // Emit Event
        sendXpEvent(userId, amount, actionType);
    }

    private void checkLevelUp(UserGamificationSummary summary) {
        int currentLevel = summary.getCurrentLevel();
        Optional<LevelThreshold> thresholdOpt = levelRepository.findTopByMinXpLessThanEqualOrderByLevelDesc(summary.getTotalXp());
        
        if (thresholdOpt.isPresent()) {
            int calculatedLevel = thresholdOpt.get().getLevel();
            if (calculatedLevel > currentLevel) {
                summary.setCurrentLevel(calculatedLevel);
                // Emit Level Up Event
                sendLevelUpEvent(summary.getUserId(), calculatedLevel);
            }
        }
    }

    private void sendXpEvent(String userId, int amount, String actionType) {
        Map<String, Object> event = new HashMap<>();
        event.put("userId", userId);
        event.put("amount", amount);
        event.put("actionType", actionType);
        event.put("timestamp", LocalDateTime.now().toString());

        try {
            kafkaTemplate.send(KafkaConfig.TOPIC_XP_EARNED, userId, objectMapper.writeValueAsString(event));
        } catch (JsonProcessingException e) {
            log.error("Failed to send kafka event", e);
        }
    }

    private void sendLevelUpEvent(String userId, int newLevel) {
        Map<String, Object> event = new HashMap<>();
        event.put("userId", userId);
        event.put("newLevel", newLevel);
        event.put("timestamp", LocalDateTime.now().toString());

        try {
            kafkaTemplate.send(KafkaConfig.TOPIC_LEVEL_UP, userId, objectMapper.writeValueAsString(event));
        } catch (JsonProcessingException e) {
            log.error("Failed to send kafka event", e);
        }
    }
}
