package com.acadevia.game.entity;

import com.acadevia.game.entity.enums.MasteryLevel;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@Entity
@Table(name = "concept_mastery", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "concept_id"})
})
public class ConceptMastery {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

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

    @Enumerated(EnumType.STRING)
    @Column(name = "mastery_level", length = 20)
    private MasteryLevel masteryLevel = MasteryLevel.NOT_STARTED;

    @Column(name = "mastery_score", precision = 5, scale = 2)
    private BigDecimal masteryScore = BigDecimal.ZERO;

    @Column(name = "total_games_played")
    private Integer totalGamesPlayed = 0;

    @Column(name = "total_games_won")
    private Integer totalGamesWon = 0;

    @Column(name = "avg_game_score", precision = 5, scale = 2)
    private BigDecimal avgGameScore = BigDecimal.ZERO;

    @Column(name = "games_to_next_level")
    private Integer gamesToNextLevel = 3;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "game_type_scores", columnDefinition = "json")
    private Map<String, Double> gameTypeScores; // GameType -> AvgScore

    @Column(name = "last_played_at")
    private LocalDateTime lastPlayedAt;

    @Column(name = "mastered_at")
    private LocalDateTime masteredAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
