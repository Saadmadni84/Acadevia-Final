package com.acadevia.quiz.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(QuizNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleQuizNotFoundException(QuizNotFoundException ex) {
        return new ResponseEntity<>(new ErrorResponse(ex.getMessage(), LocalDateTime.now()), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(QuestionNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleQuestionNotFoundException(QuestionNotFoundException ex) {
        return new ResponseEntity<>(new ErrorResponse(ex.getMessage(), LocalDateTime.now()), HttpStatus.NOT_FOUND);
    }
    
    @ExceptionHandler(AttemptNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleAttemptNotFoundException(AttemptNotFoundException ex) {
        return new ResponseEntity<>(new ErrorResponse(ex.getMessage(), LocalDateTime.now()), HttpStatus.NOT_FOUND);
    }
    
    @ExceptionHandler(SessionNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleSessionNotFoundException(SessionNotFoundException ex) {
        return new ResponseEntity<>(new ErrorResponse(ex.getMessage(), LocalDateTime.now()), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler({
        QuizNotActiveException.class, 
        MaxAttemptsExceededException.class,
        QuizTimeExpiredException.class,
        SessionFullException.class,
        InvalidQuizStateException.class
    })
    public ResponseEntity<ErrorResponse> handleBadRequestExceptions(RuntimeException ex) {
        return new ResponseEntity<>(new ErrorResponse(ex.getMessage(), LocalDateTime.now()), HttpStatus.BAD_REQUEST);
    }
    
    @ExceptionHandler({
        QuizAlreadyInProgressException.class,
        DailyChallengeAlreadyCompletedException.class
    })
    public ResponseEntity<ErrorResponse> handleConflictExceptions(RuntimeException ex) {
        return new ResponseEntity<>(new ErrorResponse(ex.getMessage(), LocalDateTime.now()), HttpStatus.CONFLICT);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldError().getDefaultMessage();
        return new ResponseEntity<>(new ErrorResponse(message, LocalDateTime.now()), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGlobalException(Exception ex) {
        return new ResponseEntity<>(new ErrorResponse("An unexpected error occurred: " + ex.getMessage(), LocalDateTime.now()), HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
