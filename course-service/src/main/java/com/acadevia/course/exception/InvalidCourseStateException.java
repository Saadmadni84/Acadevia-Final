package com.acadevia.course.exception;

public class InvalidCourseStateException extends RuntimeException {
    public InvalidCourseStateException(String message) {
        super(message);
    }
}
