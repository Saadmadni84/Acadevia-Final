package com.acadevia.quiz.entity;

import com.acadevia.quiz.util.StringListConverter;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "daily_challenges")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyChallenge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate challengeDate;

    @Column(nullable = false)
    private Integer classGrade;

    @Column(nullable = false)
    private String subject;

    @Column(columnDefinition = "VARCHAR(50) DEFAULT 'ALL'")
    private String board;

    @Column(columnDefinition = "VARCHAR(20) DEFAULT 'en'")
    private String language;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "quiz_id")
    private Long quizId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", insertable = false, updatable = false)
    private Quiz quiz;

    @Column(columnDefinition = "INT DEFAULT 10")
    private Integer totalQuestions;

    @Column(columnDefinition = "INT DEFAULT 10")
    private Integer timeLimitMinutes;

    @Column(columnDefinition = "VARCHAR(20) DEFAULT 'MIXED'")
    private String difficultyLevel;

    @Column(columnDefinition = "INT DEFAULT 30")
    private Integer xpReward;

    @Column(columnDefinition = "INT DEFAULT 3")
    private Integer creditReward;

    @Column(columnDefinition = "INT DEFAULT 10")
    private Integer streakBonusXp;

    @Column(columnDefinition = "INT DEFAULT 0")
    private Integer totalParticipants;

    @Column(columnDefinition = "DECIMAL(5,2) DEFAULT 0.00")
    private Double avgScorePct;

    @Column(columnDefinition = "INT DEFAULT 0")
    private Integer highestScore;

    @Convert(converter = StringListConverter.class)
    @Column(columnDefinition = "JSON")
    private List<String> topics;

    @Column(columnDefinition = "BOOLEAN DEFAULT TRUE")
    private Boolean isActive;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
