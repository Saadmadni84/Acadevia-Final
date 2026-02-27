package com.acadevia.quiz.dto.request;

import com.acadevia.quiz.entity.enums.DifficultyLevel;
import com.acadevia.quiz.entity.enums.QuestionType;
import lombok.Data;

import java.util.List;

@Data
public class CreateQuestionRequest {
    private Long quizId;
    
    private String questionText;
    private QuestionType questionType;
    
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;
    private String optionE;
    private String optionF;
    
    private String correctAnswer;
    private List<String> correctOptions;
    
    private String explanation;
    private List<String> solutionSteps;
    private String hint;
    
    private String questionImageUrl;
    private String explanationImageUrl;
    private String questionAudioUrl;
    
    private String subject;
    private Integer classGrade;
    private String board;
    private String topic;
    private String concept;
    private String chapter;
    private DifficultyLevel difficultyLevel;
    private String language;
    private List<String> tags;
    
    private Integer marks;
    private Integer xpValue;
    private Integer timeExpectedSec;
    
    private Boolean isBankQuestion;
    private String source;
    
    private Integer sequenceOrder;
}
