package com.acadevia.quiz.dto.request;

import com.acadevia.quiz.entity.enums.QuizMode;
import lombok.Data;

@Data
public class StartQuizRequest {
    private Long quizId;
    private QuizMode quizMode;
    private Long multiplayerSessionId;
    private String platform;
    private String deviceType;
    private String ipAddress;
}
