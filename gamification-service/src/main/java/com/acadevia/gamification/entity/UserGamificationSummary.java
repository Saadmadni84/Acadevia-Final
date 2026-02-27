package com.acadevia.gamification.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_gamification_summaries")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserGamificationSummary {

    @Id
    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "total_xp", nullable = false)
    @Builder.Default
    private Long totalXp = 0L;

    @Column(name = "current_level", nullable = false)
    @Builder.Default
    private Integer currentLevel = 1;

    @Column(name = "total_credits", nullable = false)
    @Builder.Default
    private Long totalCredits = 0L;

    @Column(name = "wallet_balance", nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal walletBalance = BigDecimal.ZERO;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
