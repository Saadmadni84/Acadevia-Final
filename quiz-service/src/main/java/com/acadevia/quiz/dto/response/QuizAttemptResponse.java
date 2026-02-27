package com.acadevia.quiz.dto.response;

import com.acadevia.quiz.entity.enums.AttemptStatus;
import com.acadevia.quiz.entity.enums.QuizMode;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class QuizAttemptResponse {
    private Long id;
    private Long quizId;
    private Long userId;
    
    private AttemptStatus status;
    private Integer score;
    private Double percentage;
    private Boolean isPassed;
    
    private Integer correctAnswers;
    private Integer wrongAnswers;
    private Integer skippedQuestions;
    
    private Integer totalTimeTakenSec;
    private Integer attemptNumber;
    
    private Integer xpEarned;
    private Integer creditsEarned;
    
    private Double accuracy;
    private Double speed;
    private Double percentile;
    
    private QuizMode quizMode;
    private String deviceType;
    private String exitReason;
    
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    
    // Includes minimal quiz info
    private String quizTitle;
    private Integer totalQuestions;
}
