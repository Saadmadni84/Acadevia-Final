package com.acadevia.quiz.dto.request;

import com.acadevia.quiz.entity.enums.DifficultyLevel;
import com.acadevia.quiz.entity.enums.QuizType;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class CreateQuizRequest {
    private String title;
    private String description;
    private String instructions;
    
    private Long courseId;
    private Long moduleId;
    private Long lessonId;
    private Long chapterId;
    private Long conceptId;
    
    private QuizType quizType;
    private DifficultyLevel difficultyLevel;
    
    private String subject;
    private Integer classGrade;
    private String board;
    private String language;
    private String topic;
    private List<String> tags;
    
    private Integer totalQuestions;
    private Integer timeLimitMinutes;
    private Integer passPercentage;
    private Integer maxAttempts;
    
    private Boolean negativeMarking;
    private BigDecimal negativeMarkValue;
    
    private Boolean shuffleQuestions;
    private Boolean shuffleOptions;
    private Boolean showCorrectAnswer;
    private Boolean showExplanation;
    private Boolean showResultImmediately;
    private Boolean allowReview;
    private Boolean allowSkip;
    private Boolean oneQuestionAtTime;
    private Boolean allowBackNavigation;
    
    private Integer xpReward;
    private Integer xpPerCorrect;
    private Integer xpBonusPerfect;
    private Integer xpBonusSpeed;
    private Integer creditReward;
    
    private Integer marksPerQuestion;
}
