package com.acadevia.game.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "game_leaderboard_entries", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"game_id", "user_id"})
})
public class GameLeaderboardEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_id", nullable = false)
    private Game game;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "best_score", nullable = false)
    private Integer bestScore = 0;

    @Column(name = "best_percentage", precision = 5, scale = 2)
    private BigDecimal bestPercentage = BigDecimal.ZERO;

    @Column(name = "best_time_sec")
    private Integer bestTimeSec;

    @Column(name = "total_plays")
    private Integer totalPlays = 0;

    @Column(name = "total_wins")
    private Integer totalWins = 0;

    @Column(name = "win_rate", precision = 5, scale = 2)
    private BigDecimal winRate = BigDecimal.ZERO;

    @Column(name = "avg_score", precision = 7, scale = 2)
    private BigDecimal avgScore = BigDecimal.ZERO;

    @Column(name = "avg_time_sec")
    private Integer avgTimeSec = 0;

    @Column(name = "current_streak")
    private Integer currentStreak = 0;

    @Column(name = "best_streak")
    private Integer bestStreak = 0;

    @Column(name = "last_played_at")
    private LocalDateTime lastPlayedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
