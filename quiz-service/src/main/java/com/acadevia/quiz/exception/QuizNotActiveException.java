package com.acadevia.quiz.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class QuizNotActiveException extends RuntimeException {
    public QuizNotActiveException(String message) {
        super(message);
    }
}
