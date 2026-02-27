package com.acadevia.gamification.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "achievements")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Achievement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "achievement_name", nullable = false, unique = true)
    private String achievementName;

    @Column(name = "display_name", nullable = false)
    private String displayName;

    @Column
    private String description;

    @Column(nullable = false)
    private String category; // 'Learning', 'Streak', etc.

    @Column(name = "target_value", nullable = false)
    private Integer targetValue;

    @Column(name = "metric_type", nullable = false)
    private String metricType; // 'TOTAL_XP', 'COURSES_COMPLETED'

    @Column(name = "reward_xp")
    private Integer rewardXp;

    @Column(name = "reward_credits")
    private Integer rewardCredits;

    @Column(name = "icon_url")
    private String iconUrl;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
