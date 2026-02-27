package com.acadevia.quiz.dto.response;

import com.acadevia.quiz.entity.enums.QuestionType;
import com.acadevia.quiz.entity.enums.DifficultyLevel;
import lombok.Data;

import java.util.List;

@Data
public class QuestionResponse {
    private Long id;
    private Long quizId;
    private String questionText;
    private QuestionType questionType;
    
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;
    private String optionE;
    private String optionF;
    
    // correct answer fields might be hidden based on quiz context
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
    
    private Integer marks;
    private Integer xpValue;
    private Integer timeExpectedSec;
    
    private Integer sequenceOrder;
}
