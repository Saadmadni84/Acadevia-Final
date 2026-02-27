package com.acadevia.gamification.service;

import com.acadevia.gamification.config.KafkaConfig;
import com.acadevia.gamification.entity.Badge;
import com.acadevia.gamification.entity.UserBadge;
import com.acadevia.gamification.entity.UserGamificationSummary;
import com.acadevia.gamification.entity.UserStreakSummary;
import com.acadevia.gamification.repository.BadgeRepository;
import com.acadevia.gamification.repository.UserBadgeRepository;
import com.acadevia.gamification.repository.UserGamificationSummaryRepository;
import com.acadevia.gamification.repository.UserStreakSummaryRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class BadgeService {

    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final UserGamificationSummaryRepository summaryRepository;
    private final UserStreakSummaryRepository streakRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    @Transactional
    public void checkBadges(String userId) {
        // Fetch User State
        UserGamificationSummary xpSummary = summaryRepository.findById(userId).orElse(null);
        UserStreakSummary streakSummary = streakRepository.findById(userId).orElse(null);
        List<UserBadge> earnedBadges = userBadgeRepository.findByUserId(userId);
        Set<UUID> earnedBadgeIds = new HashSet<>();
        earnedBadges.forEach(b -> earnedBadgeIds.add(b.getBadge().getId()));

        List<Badge> allBadges = badgeRepository.findAll();

        for (Badge badge : allBadges) {
            if (earnedBadgeIds.contains(badge.getId())) continue;

            boolean earned = false;
            switch (badge.getConditionType()) {
                case "XP_TOTAL":
                    if (xpSummary != null && xpSummary.getTotalXp() >= badge.getConditionValue()) {
                        earned = true;
                    }
                    break;
                case "STREAK_DAYS":
                    if (streakSummary != null && streakSummary.getMaxStreak() >= badge.getConditionValue()) {
                        earned = true;
                    }
                    break;
                // Add logic for COURSE_COUNT etc. (Requires querying specific service or transaction history)
                // For now, only implementing local table checks
                default:
                    break;
            }

            if (earned) {
                awardBadge(userId, badge);
            }
        }
    }

    private void awardBadge(String userId, Badge badge) {
        UserBadge userBadge = UserBadge.builder()
                .userId(userId)
                .badge(badge)
                .earnedAt(LocalDateTime.now())
                .build();
        userBadgeRepository.save(userBadge);

        log.info("Badge Unlocked: {} for user {}", badge.getBadgeName(), userId);

        sendBadgeEvent(userId, badge);
    }

    private void sendBadgeEvent(String userId, Badge badge) {
        Map<String, Object> event = new HashMap<>();
        event.put("userId", userId);
        event.put("badgeId", badge.getId());
        event.put("badgeName", badge.getBadgeName());
        event.put("timestamp", LocalDateTime.now().toString());

        try {
            kafkaTemplate.send(KafkaConfig.TOPIC_BADGE_UNLOCKED, userId, objectMapper.writeValueAsString(event));
        } catch (JsonProcessingException e) {
            log.error("Failed to send kafka event", e);
        }
    }
}
