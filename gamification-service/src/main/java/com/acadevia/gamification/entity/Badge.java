package com.acadevia.gamification.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "badges")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Badge {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "badge_name", nullable = false, unique = true)
    private String badgeName;

    @Column(name = "display_name", nullable = false)
    private String displayName;

    @Column
    private String description;

    @Column(name = "icon_url")
    private String iconUrl;

    @Column(nullable = false)
    private String category; // 'Learning', 'Social', 'Streak', etc.

    @Column(name = "condition_type", nullable = false)
    private String conditionType; // 'COURSE_COUNT', 'XP_TOTAL', 'FIRST_LOGIN'

    @Column(name = "condition_value", nullable = false)
    private Integer conditionValue; // Threshold value

    @Column(name = "xp_reward")
    private Integer xpReward;

    @Column(name = "credit_reward")
    private Integer creditReward;

    @Column(name = "is_secret")
    private Boolean isSecret;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
