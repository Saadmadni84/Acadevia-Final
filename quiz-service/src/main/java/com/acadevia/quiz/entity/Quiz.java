package com.acadevia.quiz.entity;

import com.acadevia.quiz.entity.enums.DifficultyLevel;
import com.acadevia.quiz.entity.enums.QuizStatus;
import com.acadevia.quiz.entity.enums.QuizType;
import com.acadevia.quiz.util.StringListConverter;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "quizzes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(columnDefinition = "TEXT")
    private String instructions;

    // Linking
    private Long courseId;
    private Long moduleId;
    private Long lessonId;
    private Long chapterId;
    private Long conceptId;

    // Classification
    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "VARCHAR(20) DEFAULT 'PRACTICE'")
    private QuizType quizType;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "VARCHAR(20) DEFAULT 'DRAFT'")
    private QuizStatus quizStatus;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "VARCHAR(20) DEFAULT 'MEDIUM'")
    private DifficultyLevel difficultyLevel;

    @Column(nullable = false)
    private String subject;

    @Column(nullable = false)
    private Integer classGrade;

    @Column(columnDefinition = "VARCHAR(50) DEFAULT 'ALL'")
    private String board;

    @Column(columnDefinition = "VARCHAR(20) DEFAULT 'en'")
    private String language;

    private String topic;

    @Convert(converter = StringListConverter.class)
    @Column(columnDefinition = "JSON")
    private List<String> tags;

    // Configuration
    @Column(nullable = false)
    private Integer totalQuestions;

    @Column(columnDefinition = "INT DEFAULT 30")
    private Integer timeLimitMinutes;

    @Column(columnDefinition = "INT DEFAULT 60")
    private Integer passPercentage;

    @Column(columnDefinition = "INT DEFAULT 3")
    private Integer maxAttempts;

    @Column(columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean negativeMarking;

    @Column(precision = 3, scale = 2, columnDefinition = "DECIMAL(3,2) DEFAULT 0.25")
    private BigDecimal negativeMarkValue;

    @Column(columnDefinition = "BOOLEAN DEFAULT TRUE")
    private Boolean shuffleQuestions;

    @Column(columnDefinition = "BOOLEAN DEFAULT TRUE")
    private Boolean shuffleOptions;

    @Column(columnDefinition = "BOOLEAN DEFAULT TRUE")
    private Boolean showCorrectAnswer;

    @Column(columnDefinition = "BOOLEAN DEFAULT TRUE")
    private Boolean showExplanation;

    @Column(columnDefinition = "BOOLEAN DEFAULT TRUE")
    private Boolean showResultImmediately;

    @Column(columnDefinition = "BOOLEAN DEFAULT TRUE")
    private Boolean allowReview;

    @Column(columnDefinition = "BOOLEAN DEFAULT TRUE")
    private Boolean allowSkip;

    @Column(columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean oneQuestionAtTime;

    @Column(columnDefinition = "BOOLEAN DEFAULT TRUE")
    private Boolean allowBackNavigation;

    // Rewards
    @Column(columnDefinition = "INT DEFAULT 50")
    private Integer xpReward;

    @Column(columnDefinition = "INT DEFAULT 5")
    private Integer xpPerCorrect;

    @Column(columnDefinition = "INT DEFAULT 50")
    private Integer xpBonusPerfect;

    @Column(columnDefinition = "INT DEFAULT 20")
    private Integer xpBonusSpeed;

    @Column(columnDefinition = "INT DEFAULT 5")
    private Integer creditReward;

    // Marks
    @Column(columnDefinition = "INT DEFAULT 1")
    private Integer marksPerQuestion;

    @Column(columnDefinition = "INT DEFAULT 0")
    private Integer totalMarks;

    // Scheduling
    private LocalDateTime scheduledStart;
    private LocalDateTime scheduledEnd;

    // Stats
    @Column(columnDefinition = "INT DEFAULT 0")
    private Integer totalAttempts;

    @Column(columnDefinition = "INT DEFAULT 0")
    private Integer uniqueAttempters;

    @Column(columnDefinition = "DECIMAL(5,2) DEFAULT 0.00")
    private Double avgScorePct;

    @Column(columnDefinition = "INT DEFAULT 0")
    private Integer avgTimeSeconds;

    @Column(columnDefinition = "DECIMAL(5,2) DEFAULT 0.00")
    private Double passRate;

    @Column(columnDefinition = "INT DEFAULT 0")
    private Integer highestScore;

    @Column(columnDefinition = "INT DEFAULT 0")
    private Integer lowestScore;

    // Ownership
    @Column(nullable = false)
    private Long createdBy;

    private Long schoolId;

    @Column(columnDefinition = "BOOLEAN DEFAULT TRUE")
    private Boolean isActive;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sequenceOrder ASC")
    private List<Question> questions = new ArrayList<>();
}
