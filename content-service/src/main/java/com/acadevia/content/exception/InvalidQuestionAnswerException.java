package com.acadevia.content.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InvalidQuestionAnswerException extends RuntimeException {

    public InvalidQuestionAnswerException(String message) {
        super(message);
    }
}
