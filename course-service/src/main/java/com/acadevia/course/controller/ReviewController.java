package com.acadevia.course.controller;

import com.acadevia.course.dto.request.CreateReviewRequest;
import com.acadevia.course.dto.request.UpdateReviewRequest;
import com.acadevia.course.dto.response.MessageResponse;
import com.acadevia.course.dto.response.PagedResponse;
import com.acadevia.course.dto.response.ReviewResponse;
import com.acadevia.course.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping("/course/{courseId}")
    public ResponseEntity<ReviewResponse> createReview(
            @PathVariable Long courseId,
            @Valid @RequestBody CreateReviewRequest request,
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reviewService.createReview(courseId, request, userId));
    }

    @PutMapping("/course/{courseId}") // Typically ID of review is better, but specs say per course
    public ResponseEntity<ReviewResponse> updateReview(
            @PathVariable Long courseId,
            @Valid @RequestBody UpdateReviewRequest request,
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(reviewService.updateReview(courseId, request, userId));
    }

    @DeleteMapping("/course/{courseId}")
    public ResponseEntity<MessageResponse> deleteReview(
            @PathVariable Long courseId,
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(reviewService.deleteReview(courseId, userId));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<PagedResponse<ReviewResponse>> getCourseReviews(
            @PathVariable Long courseId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        return ResponseEntity.ok(reviewService.getCourseReviews(courseId, page, size));
    }

    @PostMapping("/{reviewId}/reply")
    public ResponseEntity<MessageResponse> replyToReview(
            @PathVariable Long reviewId,
            @RequestBody String reply,
            @RequestHeader("X-User-Id") Long teacherId) {
        return ResponseEntity.ok(reviewService.replyToReview(reviewId, reply, teacherId));
    }

    @PostMapping("/{reviewId}/helpful")
    public ResponseEntity<MessageResponse> markHelpful(
            @PathVariable Long reviewId,
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(reviewService.markReviewHelpful(reviewId, userId));
    }
}
