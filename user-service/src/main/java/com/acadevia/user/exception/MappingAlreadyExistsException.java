package com.acadevia.user.exception;

public class MappingAlreadyExistsException extends RuntimeException {
    public MappingAlreadyExistsException(String message) {
        super(message);
    }
}
