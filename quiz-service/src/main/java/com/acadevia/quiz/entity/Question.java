package com.acadevia.quiz.entity;

import com.acadevia.quiz.entity.enums.DifficultyLevel;
import com.acadevia.quiz.entity.enums.QuestionType;
import com.acadevia.quiz.util.StringListConverter;
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
@Table(name = "questions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id")
    private Quiz quiz;

    // Question Content
    @Column(nullable = false, columnDefinition = "TEXT")
    private String questionText;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QuestionType questionType;

    // Options
    @Column(length = 500)
    private String optionA;
    @Column(length = 500)
    private String optionB;
    @Column(length = 500)
    private String optionC;
    @Column(length = 500)
    private String optionD;
    @Column(length = 500)
    private String optionE;
    @Column(length = 500)
    private String optionF;

    // Answer
    @Column(nullable = false, length = 500)
    private String correctAnswer;

    @Convert(converter = StringListConverter.class)
    @Column(columnDefinition = "JSON")
    private List<String> correctOptions;

    // Explanation
    @Column(columnDefinition = "TEXT")
    private String explanation;

    @Convert(converter = StringListConverter.class)
    @Column(columnDefinition = "JSON")
    private List<String> solutionSteps;

    @Column(columnDefinition = "TEXT")
    private String hint;

    // Media
    @Column(length = 500)
    private String questionImageUrl;
    @Column(length = 500)
    private String explanationImageUrl;
    @Column(length = 500)
    private String questionAudioUrl;

    // Classification
    @Column(nullable = false)
    private String subject;

    @Column(nullable = false)
    private Integer classGrade;

    @Column(columnDefinition = "VARCHAR(50) DEFAULT 'ALL'")
    private String board;

    @Column(nullable = false)
    private String topic;
    private String concept;
    private String chapter;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "VARCHAR(20) DEFAULT 'MEDIUM'")
    private DifficultyLevel difficultyLevel;

    @Column(columnDefinition = "VARCHAR(20) DEFAULT 'en'")
    private String language;

    @Convert(converter = StringListConverter.class)
    @Column(columnDefinition = "JSON")
    private List<String> tags;

    // Scoring
    @Column(columnDefinition = "INT DEFAULT 1")
    private Integer marks;

    @Column(columnDefinition = "INT DEFAULT 5")
    private Integer xpValue;

    @Column(columnDefinition = "INT DEFAULT 60")
    private Integer timeExpectedSec;

    // Stats
    @Column(columnDefinition = "INT DEFAULT 0")
    private Integer totalAttempts;

    @Column(columnDefinition = "INT DEFAULT 0")
    private Integer correctCount;

    @Column(columnDefinition = "DECIMAL(5,2) DEFAULT 0.00")
    private Double accuracyPct;

    @Column(columnDefinition = "DECIMAL(7,2) DEFAULT 0.00")
    private Double avgTimeSec;

    @Column(columnDefinition = "DECIMAL(5,3) DEFAULT 0.000")
    private Double discriminationIndex;

    // Question Bank flags
    @Column(columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean isBankQuestion;

    @Column(columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean isVerified;

    private Long verifiedBy;
    private String source;

    // Order
    @Column(columnDefinition = "INT DEFAULT 0")
    private Integer sequenceOrder;

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
}
