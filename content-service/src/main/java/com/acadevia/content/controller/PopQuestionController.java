package com.acadevia.content.controller;

import com.acadevia.content.dto.request.PopQuestionAnswerRequest;
import com.acadevia.content.dto.request.PopQuestionCreateRequest;
import com.acadevia.content.dto.request.PopQuestionUpdateRequest;
import com.acadevia.content.dto.response.*;
import com.acadevia.content.service.PopQuestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/content/pop-questions")
@RequiredArgsConstructor
public class PopQuestionController {

    private final PopQuestionService popQuestionService;

    @PostMapping
    public ResponseEntity<ApiResponse<PopQuestionResponse>> createPopQuestion(
            @Valid @RequestBody PopQuestionCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(popQuestionService.createPopQuestion(request), "Pop question created"));
    }

    @PutMapping("/{questionId}")
    public ResponseEntity<ApiResponse<PopQuestionResponse>> updatePopQuestion(
            @PathVariable Long questionId, @Valid @RequestBody PopQuestionUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(popQuestionService.updatePopQuestion(questionId, request)));
    }

    @GetMapping("/video/{videoId}")
    public ResponseEntity<ApiResponse<List<PopQuestionResponse>>> getQuestionsByVideo(@PathVariable Long videoId) {
        return ResponseEntity.ok(ApiResponse.ok(popQuestionService.getPopQuestionsByVideoId(videoId)));
    }

    @GetMapping("/video/{videoId}/range")
    public ResponseEntity<ApiResponse<List<PopQuestionResponse>>> getQuestionsInRange(
            @PathVariable Long videoId,
            @RequestParam Integer fromSec,
            @RequestParam Integer toSec) {
        return ResponseEntity.ok(ApiResponse.ok(popQuestionService.getPopQuestionsByVideoIdAndTimestampRange(videoId, fromSec, toSec)));
    }

    @PostMapping("/{questionId}/answer")
    public ResponseEntity<ApiResponse<PopQuestionAnswerResponse>> answerQuestion(
            @PathVariable Long questionId, @Valid @RequestBody PopQuestionAnswerRequest request) {
        request.setQuestionId(questionId);
        return ResponseEntity.ok(ApiResponse.ok(popQuestionService.answerPopQuestion(request), "Answer submitted"));
    }

    @GetMapping("/{questionId}/detail")
    public ResponseEntity<ApiResponse<PopQuestionDetailResponse>> getPopQuestionDetails(
            @PathVariable Long questionId, @RequestParam Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(popQuestionService.getPopQuestionDetail(questionId, userId)));
    }

    @DeleteMapping("/{questionId}")
    public ResponseEntity<ApiResponse<Void>> deletePopQuestion(@PathVariable Long questionId) {
        popQuestionService.deletePopQuestion(questionId);
        return ResponseEntity.ok(ApiResponse.ok(null, "Pop question deleted"));
    }
}
