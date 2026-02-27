package com.acadevia.user.exception;

public class StudentIdNotFoundException extends RuntimeException {
    public StudentIdNotFoundException(String message) {
        super(message);
    }
}
