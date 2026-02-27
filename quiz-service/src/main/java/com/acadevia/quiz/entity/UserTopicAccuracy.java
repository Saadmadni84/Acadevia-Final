package com.acadevia.quiz.entity;

import com.acadevia.quiz.entity.enums.DifficultyLevel;
import com.acadevia.quiz.entity.enums.HintFrequency;
import com.acadevia.quiz.entity.enums.MasteryLevel;
import com.acadevia.quiz.util.BooleanListConverter;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "user_topic_accuracy")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserTopicAccuracy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String subject;

    @Column(nullable = false)
    private String topic;

    @Column(nullable = false)
    private Integer classGrade;

    // Accuracy stats
    @Column(columnDefinition = "INT DEFAULT 0")
    private Integer totalQuestions;

    @Column(columnDefinition = "INT DEFAULT 0")
    private Integer correctAnswers;

    @Column(columnDefinition = "DECIMAL(5,2) DEFAULT 0.00")
    private Double accuracyPercentage;

    // Per-difficulty breakdown
    @Column(columnDefinition = "INT DEFAULT 0")
    private Integer easyTotal;
    @Column(columnDefinition = "INT DEFAULT 0")
    private Integer easyCorrect;
    @Column(columnDefinition = "DECIMAL(5,2) DEFAULT 0.00")
    private Double easyAccuracy;

    @Column(columnDefinition = "INT DEFAULT 0")
    private Integer mediumTotal;
    @Column(columnDefinition = "INT DEFAULT 0")
    private Integer mediumCorrect;
    @Column(columnDefinition = "DECIMAL(5,2) DEFAULT 0.00")
    private Double mediumAccuracy;

    @Column(columnDefinition = "INT DEFAULT 0")
    private Integer hardTotal;
    @Column(columnDefinition = "INT DEFAULT 0")
    private Integer hardCorrect;
    @Column(columnDefinition = "DECIMAL(5,2) DEFAULT 0.00")
    private Double hardAccuracy;

    // Recent performance
    @Column(columnDefinition = "DECIMAL(5,2) DEFAULT 0.00")
    private Double recentAccuracy;

    @Convert(converter = BooleanListConverter.class)
    @Column(columnDefinition = "JSON")
    private List<Boolean> recentAttempts;

    // Adaptive difficulty
    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "VARCHAR(20) DEFAULT 'MEDIUM'")
    private DifficultyLevel currentDifficulty;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "VARCHAR(20) DEFAULT 'MEDIUM'")
    private DifficultyLevel recommendedDifficulty;

    @Column(columnDefinition = "DECIMAL(3,2) DEFAULT 1.00")
    private Double xpMultiplier;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "VARCHAR(20) DEFAULT 'MEDIUM'")
    private HintFrequency hintFrequency;

    // Streak
    @Column(columnDefinition = "INT DEFAULT 0")
    private Integer currentStreak;

    @Column(columnDefinition = "INT DEFAULT 0")
    private Integer bestStreak;

    // Time performance
    @Column(columnDefinition = "DECIMAL(7,2) DEFAULT 0.00")
    private Double avgTimePerQuestion;

    // Mastery
    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "VARCHAR(20) DEFAULT 'NOVICE'")
    private MasteryLevel masteryLevel;

    @Column(columnDefinition = "DECIMAL(5,2) DEFAULT 0.00")
    private Double masteryScore;

    private LocalDateTime lastAttemptedAt;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
