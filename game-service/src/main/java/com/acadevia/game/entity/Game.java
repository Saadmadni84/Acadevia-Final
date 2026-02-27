package com.acadevia.game.entity;

import com.acadevia.game.entity.enums.GameDifficulty;
import com.acadevia.game.entity.enums.GameType;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "games")
public class Game {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "concept_id", nullable = false)
    private Concept concept;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chapter_id", nullable = false)
    private Chapter chapter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @Column(name = "class_grade", nullable = false)
    private Integer classGrade;

    @Column(nullable = false)
    private String title;

    @Column(name = "title_local", length = 500)
    private String titleLocal;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String instructions;

    @Enumerated(EnumType.STRING)
    @Column(name = "game_type", nullable = false)
    private GameType gameType;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private GameDifficulty difficulty = GameDifficulty.MEDIUM;

    @Column(length = 20)
    private String language = "en";

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "game_data", columnDefinition = "json", nullable = false)
    private String gameData; // Stored as JSON string, parsed by Service based on gameType

    // Config
    @Column(name = "time_limit_sec")
    private Integer timeLimitSec = 300;

    @Column(name = "min_players")
    private Integer minPlayers = 1;

    @Column(name = "max_players")
    private Integer maxPlayers = 4;

    @Column(name = "is_multiplayer")
    private Boolean isMultiplayer = false;

    // Rewards
    @Column(name = "xp_reward")
    private Integer xpReward = 30;

    @Column(name = "credit_reward")
    private Integer creditReward = 5;

    @Column(name = "xp_bonus_perfect")
    private Integer xpBonusPerfect = 20;

    @Column(name = "xp_bonus_speed")
    private Integer xpBonusSpeed = 10;

    // Scoring
    @Column(name = "max_score")
    private Integer maxScore = 100;

    @Column(name = "pass_score")
    private Integer passScore = 60;

    // Media
    @Column(name = "thumbnail_url", length = 500)
    private String thumbnailUrl;

    @Column(name = "background_url", length = 500)
    private String backgroundUrl;

    @Column(name = "sound_enabled")
    private Boolean soundEnabled = true;

    // Stats
    @Column(name = "total_plays")
    private Integer totalPlays = 0;

    @Column(name = "unique_players")
    private Integer uniquePlayers = 0;

    @Column(name = "avg_score", precision = 5, scale = 2)
    private BigDecimal avgScore = BigDecimal.ZERO;

    @Column(name = "avg_time_sec")
    private Integer avgTimeSec = 0;

    @Column(name = "completion_rate", precision = 5, scale = 2)
    private BigDecimal completionRate = BigDecimal.ZERO;

    @Column(name = "like_count")
    private Integer likeCount = 0;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json")
    private List<String> tags;

    @Column(length = 200)
    private String topic;

    // Ownership
    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "school_id")
    private Long schoolId;

    @Column(name = "is_featured")
    private Boolean isFeatured = false;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
