package com.acadevia.admin.service;

import com.acadevia.admin.dto.request.ContentReviewRequest;
import com.acadevia.admin.dto.response.ContentReviewResponse;
import com.acadevia.admin.enums.ReviewStatus;
import org.springframework.data.domain.Page;

public interface ContentModerationService {
    Page<ContentReviewResponse> getPendingReviews(int page, int size);
    Page<ContentReviewResponse> getReviewsByType(String contentType, ReviewStatus status, int page, int size);
    ContentReviewResponse reviewContent(ContentReviewRequest request, Long adminUserId);
    void submitForReview(String contentType, Long contentId, String contentTitle, Long submittedBy, String submitterName);
    Long countPendingReviews();
}
