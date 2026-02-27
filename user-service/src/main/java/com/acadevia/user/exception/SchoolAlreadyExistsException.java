package com.acadevia.user.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class SchoolAlreadyExistsException extends RuntimeException {
    public SchoolAlreadyExistsException(String message) {
        super(message);
    }
}
