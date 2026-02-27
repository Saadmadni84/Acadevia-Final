package com.acadevia.quiz.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class DailyChallengeAlreadyCompletedException extends RuntimeException {
    public DailyChallengeAlreadyCompletedException(String message) {
        super(message);
    }
}
