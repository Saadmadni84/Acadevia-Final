package com.acadevia.course.exception;

public class MaxEnrollmentReachedException extends RuntimeException {
    public MaxEnrollmentReachedException(String message) {
        super(message);
    }
}
