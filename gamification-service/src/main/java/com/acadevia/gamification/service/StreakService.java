package com.acadevia.gamification.service;

import com.acadevia.gamification.entity.DailyStreak;
import com.acadevia.gamification.entity.UserStreakSummary;
import com.acadevia.gamification.repository.DailyStreakRepository;
import com.acadevia.gamification.repository.UserStreakSummaryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Slf4j
public class StreakService {

    private final UserStreakSummaryRepository streakSummaryRepository;
    private final DailyStreakRepository dailyStreakRepository;
    private final Clock clock;

    @Transactional
    public void updateStreak(String userId) {
        LocalDate today = LocalDate.now(clock);

        // 1. Check if activity already recorded today
        if (dailyStreakRepository.existsByUserIdAndActivityDate(userId, today)) {
            return;
        }

        // 2. Record daily activity
        DailyStreak dailyStreak = DailyStreak.builder()
                .userId(userId)
                .activityDate(today)
                .activityType("LOGIN") // Or generic activity
                .build();
        dailyStreakRepository.save(dailyStreak);

        // 3. Update summary
        UserStreakSummary summary = streakSummaryRepository.findById(userId)
                .orElse(UserStreakSummary.builder()
                        .userId(userId)
                        .currentStreak(0)
                        .maxStreak(0)
                        .freezeInventory(0)
                        .build());

        LocalDate lastActivity = summary.getLastActivityDate();

        if (lastActivity == null) {
            // First ever activity
            summary.setCurrentStreak(1);
        } else if (lastActivity.equals(today.minusDays(1))) {
            // Continued streak
            summary.setCurrentStreak(summary.getCurrentStreak() + 1);
        } else {
            // Streak broken? Check freezes
            if (summary.getFreezeInventory() > 0) {
                // Determine days missed
                long daysMissed = java.time.temporal.ChronoUnit.DAYS.between(lastActivity, today) - 1;
                
                if (daysMissed <= summary.getFreezeInventory()) {
                     // Saved by freeze
                     summary.setFreezeInventory(summary.getFreezeInventory() - (int) daysMissed);
                     summary.setCurrentStreak(summary.getCurrentStreak() + 1);
                     log.info("Streak saved by freeze for user {}", userId);
                } else {
                    // Not enough freezes
                    summary.setCurrentStreak(1);
                }
            } else {
                summary.setCurrentStreak(1);
            }
        }

        // Update max
        if (summary.getCurrentStreak() > summary.getMaxStreak()) {
            summary.setMaxStreak(summary.getCurrentStreak());
        }

        summary.setLastActivityDate(today);
        streakSummaryRepository.save(summary);
    }
    
    public UserStreakSummary getStreakSummary(String userId) {
        return streakSummaryRepository.findById(userId)
                .orElse(UserStreakSummary.builder().userId(userId).build());
    }
}
