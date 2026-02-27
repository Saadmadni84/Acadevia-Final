package com.acadevia.game.entity;

import com.acadevia.game.entity.enums.GameDifficulty;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Entity
@Table(name = "concepts", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"chapter_id", "sequence_order"})
})
public class Concept {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

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

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "key_points", columnDefinition = "json")
    private List<String> keyPoints;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "formulas", columnDefinition = "json")
    private List<String> formulas;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "definitions", columnDefinition = "json")
    private Map<String, String> definitions;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "examples", columnDefinition = "json")
    private List<String> examples;

    @Column(name = "sequence_order", nullable = false)
    private Integer sequenceOrder;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private GameDifficulty difficulty = GameDifficulty.MEDIUM;

    @Column(name = "total_games")
    private Integer totalGames = 0;

    @Column(name = "icon_url", length = 500)
    private String iconUrl;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
