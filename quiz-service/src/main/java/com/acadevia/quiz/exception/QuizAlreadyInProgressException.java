package com.acadevia.quiz.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class QuizAlreadyInProgressException extends RuntimeException {
    public QuizAlreadyInProgressException(String message) {
        super(message);
    }
}
