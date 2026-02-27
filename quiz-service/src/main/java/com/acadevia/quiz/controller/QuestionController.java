package com.acadevia.quiz.controller;

import com.acadevia.quiz.dto.request.CreateBulkQuestionsRequest;
import com.acadevia.quiz.dto.request.CreateQuestionRequest;
import com.acadevia.quiz.dto.request.UpdateQuestionRequest;
import com.acadevia.quiz.dto.response.MessageResponse;
import com.acadevia.quiz.dto.response.PagedResponse;
import com.acadevia.quiz.dto.response.QuestionResponse;
import com.acadevia.quiz.entity.enums.QuestionType;
import com.acadevia.quiz.service.QuestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class QuestionController {

    private final QuestionService questionService;

    @PostMapping("/quizzes/{quizId}/questions")
    public ResponseEntity<QuestionResponse> addQuestion(@PathVariable Long quizId,
                                                       @Valid @RequestBody CreateQuestionRequest request) {
        return new ResponseEntity<>(questionService.createQuestion(quizId, request), HttpStatus.CREATED);
    }
    
    @PostMapping("/quizzes/{quizId}/questions/bulk")
    public ResponseEntity<List<QuestionResponse>> addBulkQuestions(@PathVariable Long quizId,
                                                                  @Valid @RequestBody CreateBulkQuestionsRequest request) {
        return new ResponseEntity<>(questionService.createBulkQuestions(quizId, request), HttpStatus.CREATED);
    }

    @PutMapping("/questions/{id}")
    public ResponseEntity<QuestionResponse> updateQuestion(@PathVariable Long id,
                                                          @Valid @RequestBody UpdateQuestionRequest request) {
        return ResponseEntity.ok(questionService.updateQuestion(id, request));
    }

    @GetMapping("/questions/{id}")
    public ResponseEntity<QuestionResponse> getQuestionById(@PathVariable Long id) {
        return ResponseEntity.ok(questionService.getQuestionById(id));
    }

    @GetMapping("/quizzes/{quizId}/questions")
    public ResponseEntity<PagedResponse<QuestionResponse>> getQuestionsByQuizId(
            @PathVariable Long quizId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(questionService.getQuestionsByQuizId(quizId, page, size));
    }
    
    @DeleteMapping("/questions/{id}")
    public ResponseEntity<MessageResponse> deleteQuestion(@PathVariable Long id) {
        questionService.deleteQuestion(id);
        return ResponseEntity.ok(new MessageResponse("Question deleted successfully"));
    }
    
    @GetMapping("/questions/bank")
    public ResponseEntity<PagedResponse<QuestionResponse>> getBankQuestions(
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String topic,
            @RequestParam(required = false) QuestionType type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(questionService.getQuestionsFromBank(subject, topic, type, page, size));
    }
}
