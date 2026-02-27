package com.acadevia.gamification.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class GamificationService {
    
    private final XpService xpService;
    private final StreakService streakService;
    private final BadgeService badgeService;

    @Transactional
    public void processEvent(String userId, String actionType, String sourceId, Map<String, Object> metadata) {
        log.info("Orchestrating gamification event: {} for user: {}", actionType, userId);

        // 1. Update Streak (if applicable)
        if ("LOGIN".equals(actionType) || "DAILY_STREAK".equals(actionType)) {
            streakService.updateStreak(userId);
        }

        // 2. Award XP/Credits
        xpService.processAction(userId, actionType, sourceId, metadata);

        // 3. Check Badges/Achievements (Triggered by state change)
        badgeService.checkBadges(userId);
        
        // 4. Update Leaderboards (Future)
    }
}
