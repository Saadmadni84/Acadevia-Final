package com.acadevia.quiz.entity;

import com.acadevia.quiz.util.StringListConverter;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "attempt_answers")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttemptAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "attempt_id", nullable = false)
    private Long attemptId;
    
    @Column(name = "question_id", nullable = false)
    private Long questionId;
    
    @Column(nullable = false)
    private Long quizId;
    
    @Column(nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attempt_id", insertable = false, updatable = false)
    private QuizAttempt attempt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", insertable = false, updatable = false)
    private Question question;

    @Column(length = 500)
    private String selectedAnswer;

    @Convert(converter = StringListConverter.class)
    @Column(columnDefinition = "JSON")
    private List<String> selectedOptions;

    private Boolean isCorrect;

    @Column(columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean isSkipped;

    @Column(columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean isMarkedReview;

    @Column(precision = 5, scale = 2, columnDefinition = "DECIMAL(5,2) DEFAULT 0.00")
    private BigDecimal marksAwarded;

    @Column(precision = 5, scale = 2, columnDefinition = "DECIMAL(5,2) DEFAULT 0.00")
    private BigDecimal negativeMarks;

    @Column(columnDefinition = "INT DEFAULT 0")
    private Integer timeTakenSeconds;

    @Column(columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean hintUsed;

    private Integer questionOrder;
    private LocalDateTime answeredAt;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
