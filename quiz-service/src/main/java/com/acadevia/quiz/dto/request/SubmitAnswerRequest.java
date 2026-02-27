package com.acadevia.quiz.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class SubmitAnswerRequest {
    private Long quizAttemptId;
    private Long questionId;
    private String selectedOption;
    private List<String> selectedOptions;
    private String textAnswer;
    private Integer timeTakenSec;
    private Boolean isMarkedForReview;
    private Boolean isSkipped;
}
