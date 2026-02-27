package com.acadevia.admin.controller;

import com.acadevia.admin.dto.request.ContentReviewRequest;
import com.acadevia.admin.dto.response.ContentReviewResponse;
import com.acadevia.admin.enums.ReviewStatus;
import com.acadevia.admin.service.ContentModerationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/moderation")
@RequiredArgsConstructor
@Tag(name = "Content Moderation", description = "Approve or reject courses/games")
@PreAuthorize("hasAnyRole('ADMIN', 'MODERATOR')")
public class ContentModerationController {

    private final ContentModerationService moderationService;

    @GetMapping("/pending")
    @Operation(summary = "Get pending content reviews")
    public ResponseEntity<Page<ContentReviewResponse>> getPendingReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(moderationService.getPendingReviews(page, size));
    }

    @PostMapping("/review")
    @Operation(summary = "Submit a review decision")
    public ResponseEntity<ContentReviewResponse> reviewContent(
            @RequestBody ContentReviewRequest request,
            @RequestHeader(name = "X-Admin-ID", required = false, defaultValue = "1") Long adminId) {
        return ResponseEntity.ok(moderationService.reviewContent(request, adminId));
    }

    @GetMapping("/history/{type}")
    public ResponseEntity<Page<ContentReviewResponse>> getReviewHistory(
            @PathVariable String type,
            @RequestParam(defaultValue = "APPROVED") ReviewStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(moderationService.getReviewsByType(type, status, page, size));
    }
}
