package com.acadevia.gamification.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaConfig {

    public static final String TOPIC_XP_EARNED = "acadevia.xp.earned";
    public static final String TOPIC_BADGE_UNLOCKED = "acadevia.badge.unlocked";
    public static final String TOPIC_ACHIEVEMENT_UNLOCKED = "acadevia.achievement.unlocked";
    public static final String TOPIC_LEVEL_UP = "acadevia.level.up";

    @Bean
    public NewTopic xpEarnedTopic() {
        return TopicBuilder.name(TOPIC_XP_EARNED)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic badgeUnlockedTopic() {
        return TopicBuilder.name(TOPIC_BADGE_UNLOCKED)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic achievementUnlockedTopic() {
        return TopicBuilder.name(TOPIC_ACHIEVEMENT_UNLOCKED)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic levelUpTopic() {
        return TopicBuilder.name(TOPIC_LEVEL_UP)
                .partitions(3)
                .replicas(1)
                .build();
    }
}
