package com.acadevia.quiz.dto.request;

import lombok.Data;

@Data
public class SubmitQuizRequest {
    private Long quizAttemptId;
    private Integer totalTimeTakenSec;
}
