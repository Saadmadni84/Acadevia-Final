package com.acadevia.quiz.controller;

import com.acadevia.quiz.dto.request.CreateQuizRequest;
import com.acadevia.quiz.dto.request.UpdateQuizRequest;
import com.acadevia.quiz.dto.response.MessageResponse;
import com.acadevia.quiz.dto.response.PagedResponse;
import com.acadevia.quiz.dto.response.QuizResponse;
import com.acadevia.quiz.service.QuizService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/quizzes")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;

    @PostMapping
    public ResponseEntity<QuizResponse> createQuiz(@Valid @RequestBody CreateQuizRequest request,
                                                  @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        // Fallback for testing without gateway
        if (userId == null) userId = 1L; 
        return new ResponseEntity<>(quizService.createQuiz(request, userId), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<QuizResponse> updateQuiz(@PathVariable Long id,
                                                  @Valid @RequestBody UpdateQuizRequest request,
                                                  @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        if (userId == null) userId = 1L;
        return ResponseEntity.ok(quizService.updateQuiz(id, request, userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuizResponse> getQuizById(@PathVariable Long id) {
        return ResponseEntity.ok(quizService.getQuizById(id));
    }

    @GetMapping
    public ResponseEntity<PagedResponse<QuizResponse>> getAllQuizzes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        return ResponseEntity.ok(quizService.getAllQuizzes(page, size, sortBy, sortDir));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteQuiz(@PathVariable Long id,
                                                     @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        if (userId == null) userId = 1L;
        quizService.deleteQuiz(id, userId);
        return ResponseEntity.ok(new MessageResponse("Quiz deleted successfully"));
    }
    
    @PatchMapping("/{id}/publish")
    public ResponseEntity<MessageResponse> publishQuiz(@PathVariable Long id,
                                                      @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        if (userId == null) userId = 1L;
        quizService.publishQuiz(id, userId);
        return ResponseEntity.ok(new MessageResponse("Quiz published successfully"));
    }
    
    @GetMapping("/course/{courseId}")
    public ResponseEntity<PagedResponse<QuizResponse>> getQuizzesByCourseId(
            @PathVariable Long courseId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(quizService.getQuizzesByCourseId(courseId, page, size));
    }
    
    @GetMapping("/teacher/me")
    public ResponseEntity<PagedResponse<QuizResponse>> getMyQuizzes(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        if (userId == null) userId = 1L;
        return ResponseEntity.ok(quizService.getQuizzesByCreator(userId, page, size));
    }
}
