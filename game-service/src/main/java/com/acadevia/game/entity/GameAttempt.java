package com.acadevia.game.entity;

import com.acadevia.game.entity.enums.GameDifficulty;
import com.acadevia.game.entity.enums.GameMode;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "game_attempts")
public class GameAttempt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_id", nullable = false)
    private Game game;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Integer score = 0;

    @Column(name = "max_score", nullable = false)
    private Integer maxScore;

    @Column(precision = 5, scale = 2)
    private BigDecimal percentage = BigDecimal.ZERO;

    @Column(name = "time_taken_sec")
    private Integer timeTakenSec = 0;

    @Column(name = "is_won")
    private Boolean isWon = false;

    @Column(name = "is_perfect")
    private Boolean isPerfect = false;

    @Column(name = "is_speed_bonus")
    private Boolean isSpeedBonus = false;

    @Column(name = "xp_earned")
    private Integer xpEarned = 0;

    @Column(name = "credits_earned")
    private Integer creditsEarned = 0;

    @Column(name = "xp_multiplier", precision = 3, scale = 2)
    private BigDecimal xpMultiplier = BigDecimal.ONE;

    @Enumerated(EnumType.STRING)
    @Column(name = "game_mode")
    private GameMode gameMode = GameMode.SOLO;

    @Enumerated(EnumType.STRING)
    @Column(name = "difficulty_played")
    private GameDifficulty difficultyPlayed = GameDifficulty.MEDIUM;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "result_data", columnDefinition = "json")
    private String resultData; // Detailed result JSON

    // Multiplayer info
    @Column(name = "session_id")
    private Long sessionId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "opponent_ids", columnDefinition = "json")
    private List<Long> opponentIds;

    @Column(name = "rank_in_session")
    private Integer rankInSession;

    @CreationTimestamp
    @Column(name = "played_at", updatable = false)
    private LocalDateTime playedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;
}
