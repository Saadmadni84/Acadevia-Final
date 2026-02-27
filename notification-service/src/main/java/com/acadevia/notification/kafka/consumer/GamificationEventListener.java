package com.acadevia.notification.kafka.consumer;

import com.acadevia.notification.dto.kafka.BadgeUnlockedEvent;
import com.acadevia.notification.dto.kafka.StreakMilestoneEvent;
import com.acadevia.notification.dto.kafka.RankChangedEvent;
import com.acadevia.notification.enums.NotificationCategory;
import com.acadevia.notification.enums.NotificationPriority;
import com.acadevia.notification.service.NotificationDispatcher;
import com.acadevia.notification.util.Constants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@Slf4j
@RequiredArgsConstructor
public class GamificationEventListener {

    private final NotificationDispatcher notificationDispatcher;

    @KafkaListener(topics = Constants.TOPIC_BADGE_UNLOCKED, groupId = Constants.GROUP_ID_NOTIFICATION)
    public void handleBadgeUnlocked(BadgeUnlockedEvent event) {
        log.info("Received BadgeUnlockedEvent for user: {}", event.getUserId());
        
        notificationDispatcher.dispatch(
                event.getUserId(),
                NotificationCategory.BADGE,
                "New Badge Unlocked!",
                "Congratulations! You've unlocked the " + event.getBadgeName() + " badge.",
                Map.of(
                        "badgeId", event.getBadgeId(),
                        "badgeName", event.getBadgeName(),
                        "badgeIcon", event.getBadgeIconUrl()
                ),
                NotificationPriority.HIGH,
                "/profile/badges"
        );
    }

    @KafkaListener(topics = Constants.TOPIC_STREAK_MILESTONE, groupId = Constants.GROUP_ID_NOTIFICATION)
    public void handleStreakMilestone(StreakMilestoneEvent event) {
        log.info("Received StreakMilestoneEvent for user: {}", event.getUserId());
        
        notificationDispatcher.dispatch(
                event.getUserId(),
                NotificationCategory.STREAK,
                event.getStreakDays() + " Day Streak!",
                "You're on fire! " + event.getStreakDays() + " days learning streak achieved.",
                Map.of(
                        "streakDays", event.getStreakDays(),
                        "xpAwarded", event.getXpAwarded()
                ),
                NotificationPriority.MEDIUM,
                "/stats"
        );
    }

    @KafkaListener(topics = Constants.TOPIC_RANK_CHANGED, groupId = Constants.GROUP_ID_NOTIFICATION)
    public void handleRankChanged(RankChangedEvent event) {
        if ("UP".equalsIgnoreCase(event.getDirection())) {
            log.info("Received RankChangedEvent (UP) for user: {}", event.getUserId());
            
            notificationDispatcher.dispatch(
                    event.getUserId(),
                    NotificationCategory.LEADERBOARD,
                    "You've ranked up!",
                    "You are now rank #" + event.getNewRank() + " on the leaderboard!",
                    Map.of(
                            "oldRank", event.getOldRank(),
                            "newRank", event.getNewRank(),
                            "leaderboardId", event.getScopeId()
                    ),
                    NotificationPriority.LOW,
                    "/leaderboard"
            );
        }
    }
}
