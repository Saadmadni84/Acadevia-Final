package com.acadevia.quiz.dto.request;

import com.acadevia.quiz.entity.enums.MultiplayerMode;
import lombok.Data;

@Data
public class CreateMultiplayerSessionRequest {
    private Long quizId;
    private MultiplayerMode mode;
    private Integer maxParticipants;
    private Integer entryFee;
    private Boolean isPrivate;
}
