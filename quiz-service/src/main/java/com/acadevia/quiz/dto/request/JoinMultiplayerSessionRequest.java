package com.acadevia.quiz.dto.request;

import lombok.Data;

@Data
public class JoinMultiplayerSessionRequest {
    private String joinCode;
    private String password;
}
