package com.acadevia.quiz.dto.response;

import lombok.Data;

import java.util.List;

@Data
public class AttemptAnswerResponse {
    private Long id;
    private Long questionId;
    private String selectedOption;
    private List<String> selectedOptions;
    private String textAnswer;
    private Boolean isCorrect;
    private Integer timeTakenSec;
    private Boolean isMarkedForReview;
    private Boolean isSkipped;
    private Integer marksAwarded;
    
    // Basic Question details for review
    private String questionText;
    private String correctAnswer;
    private List<String> correctOptions;
    private String explanation;
}
