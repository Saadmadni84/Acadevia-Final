package com.acadevia.leaderboard.scheduler;

import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class LeaderboardScheduler {

    // Snapshot creation logic would go here
    // For example, running @Scheduled(cron = "0 0 0 * * *") to take daily snapshots
    // of the Redis Sorted Sets and save them to MySQL LeaderboardSnapshot entities.

    @Scheduled(cron = "${acadevia.leaderboard.scheduler.daily-reset-cron:0 0 0 * * *}")
    public void processDailySnapshots() {
        log.info("Starting daily leaderboard snapshot processing...");
        // Logic to:
        // 1. Iterate over active keys
        // 2. Fetch top 100
        // 3. Save to MySQL
        // 4. (Optional) Expire/Delete old keys if not handled by TTL
    }

    @Scheduled(cron = "${acadevia.leaderboard.scheduler.weekly-reset-cron:0 0 0 * * MON}")
    public void processWeeklySnapshots() {
        log.info("Starting weekly leaderboard snapshot processing...");
    }
}
