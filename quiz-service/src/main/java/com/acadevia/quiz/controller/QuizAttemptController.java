package com.acadevia.quiz.controller;

import com.acadevia.quiz.dto.request.StartQuizRequest;
import com.acadevia.quiz.dto.request.SubmitAnswerRequest;
import com.acadevia.quiz.dto.request.SubmitQuizRequest;
import com.acadevia.quiz.dto.response.AttemptAnswerResponse;
import com.acadevia.quiz.dto.response.QuestionResponse;
import com.acadevia.quiz.dto.response.QuizAttemptResponse;
import com.acadevia.quiz.service.QuizAttemptService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/attempts")
@RequiredArgsConstructor
public class QuizAttemptController {

    private final QuizAttemptService quizAttemptService;

    @PostMapping("/start")
    public ResponseEntity<QuizAttemptResponse> startQuiz(@Valid @RequestBody StartQuizRequest request,
                                                        @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        if (userId == null) userId = 1L;
        return new ResponseEntity<>(quizAttemptService.startQuiz(request, userId), HttpStatus.CREATED);
    }

    @PostMapping("/answer")
    public ResponseEntity<AttemptAnswerResponse> submitAnswer(@Valid @RequestBody SubmitAnswerRequest request,
                                                             @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        if (userId == null) userId = 1L;
        return ResponseEntity.ok(quizAttemptService.submitAnswer(request, userId));
    }
    
    @GetMapping("/{id}/next-question")
    public ResponseEntity<QuestionResponse> getNextQuestion(@PathVariable Long id,
                                                           @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        if (userId == null) userId = 1L;
        QuestionResponse question = quizAttemptService.getNextQuestion(id, userId);
        if (question == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(question);
    }

    @PostMapping("/submit")
    public ResponseEntity<QuizAttemptResponse> submitQuiz(@Valid @RequestBody SubmitQuizRequest request,
                                                         @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        if (userId == null) userId = 1L;
        return ResponseEntity.ok(quizAttemptService.submitQuiz(request, userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuizAttemptResponse> getAttempt(@PathVariable Long id,
                                                         @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        if (userId == null) userId = 1L;
        return ResponseEntity.ok(quizAttemptService.getAttempt(id, userId));
    }

    @GetMapping("/{id}/review")
    public ResponseEntity<List<AttemptAnswerResponse>> getAttemptReview(@PathVariable Long id,
                                                                       @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        if (userId == null) userId = 1L;
        return ResponseEntity.ok(quizAttemptService.getAttemptReview(id, userId));
    }
}
