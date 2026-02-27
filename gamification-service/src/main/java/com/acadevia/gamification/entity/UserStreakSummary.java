package com.acadevia.gamification.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_streak_summaries")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserStreakSummary {

    @Id
    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "current_streak", nullable = false)
    @Builder.Default
    private Integer currentStreak = 0;

    @Column(name = "max_streak", nullable = false)
    @Builder.Default
    private Integer maxStreak = 0;

    @Column(name = "last_activity_date")
    private LocalDate lastActivityDate;

    @Column(name = "freeze_inventory", nullable = false)
    @Builder.Default
    private Integer freezeInventory = 0;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
