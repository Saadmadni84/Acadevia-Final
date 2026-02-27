package com.acadevia.quiz.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class QuizTimeExpiredException extends RuntimeException {
    public QuizTimeExpiredException(String message) {
        super(message);
    }
}
