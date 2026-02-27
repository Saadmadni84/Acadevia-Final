package com.acadevia.quiz.entity;

import com.acadevia.quiz.entity.enums.AttemptStatus;
import com.acadevia.quiz.entity.enums.QuizMode;
import com.acadevia.quiz.util.LongListConverter;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "quiz_attempts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "quiz_id", nullable = false)
    private Long quizId;
    
    @Column(nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", insertable = false, updatable = false)
    private Quiz quiz;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "VARCHAR(20) DEFAULT 'IN_PROGRESS'")
    private AttemptStatus status;

    @Column(columnDefinition = "INT DEFAULT 1")
    private Integer attemptNumber;

    // Scoring
    @Column(columnDefinition = "INT DEFAULT 0")
    private Integer score;

    @Column(nullable = false)
    private Integer totalMarks;

    @Column(columnDefinition = "DECIMAL(5,2) DEFAULT 0.00")
    private Double percentage;

    @Column(columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean isPassed;

    // Question breakdown
    @Column(nullable = false)
    private Integer totalQuestions;

    @Column(columnDefinition = "INT DEFAULT 0")
    private Integer correctAnswers;

    @Column(columnDefinition = "INT DEFAULT 0")
    private Integer wrongAnswers;

    @Column(columnDefinition = "INT DEFAULT 0")
    private Integer skippedAnswers;

    // Negative marking
    @Column(precision = 5, scale = 2, columnDefinition = "DECIMAL(5,2) DEFAULT 0.00")
    private BigDecimal negativeMarks;

    @Column(precision = 7, scale = 2, columnDefinition = "DECIMAL(7,2) DEFAULT 0.00")
    private BigDecimal netScore;

    // Time
    private Integer timeLimitSeconds;

    @Column(columnDefinition = "INT DEFAULT 0")
    private Integer timeTakenSeconds;

    @Column(columnDefinition = "DECIMAL(7,2) DEFAULT 0.00")
    private Double avgTimePerQuestion;

    // XP and rewards
    @Column(columnDefinition = "INT DEFAULT 0")
    private Integer xpEarned;

    @Column(columnDefinition = "INT DEFAULT 0")
    private Integer creditsEarned;

    @Column(columnDefinition = "DECIMAL(3,2) DEFAULT 1.00")
    private Double xpMultiplier;

    @Column(columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean isPerfectScore;

    @Column(columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean isSpeedBonus;

    // Adaptive info
    @Enumerated(EnumType.STRING)
    private QuizMode quizMode;

    private String difficultyLevel;
    private Double adaptiveScore;

    @Column(columnDefinition = "JSON")
    private String answersJson;

    @Convert(converter = LongListConverter.class)
    @Column(columnDefinition = "JSON")
    private List<Long> questionOrder;

    @Column(nullable = false)
    @CreationTimestamp
    private LocalDateTime startedAt;

    private LocalDateTime submittedAt;
    private LocalDateTime completedAt;
    
    @CreationTimestamp
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "attempt", cascade = CascadeType.ALL)
    private List<AttemptAnswer> answers = new ArrayList<>();
}
