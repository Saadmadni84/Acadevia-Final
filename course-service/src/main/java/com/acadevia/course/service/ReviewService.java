package com.acadevia.course.service;

import com.acadevia.course.dto.request.CreateReviewRequest;
import com.acadevia.course.dto.request.UpdateReviewRequest;
import com.acadevia.course.dto.response.MessageResponse;
import com.acadevia.course.dto.response.PagedResponse;
import com.acadevia.course.dto.response.ReviewResponse;

public interface ReviewService {
    ReviewResponse createReview(Long courseId, CreateReviewRequest request, Long userId);

    ReviewResponse updateReview(Long courseId, UpdateReviewRequest request, Long userId);

    MessageResponse deleteReview(Long courseId, Long userId);

    PagedResponse<ReviewResponse> getCourseReviews(Long courseId, int page, int size);

    MessageResponse replyToReview(Long reviewId, String reply, Long teacherId);

    MessageResponse markReviewHelpful(Long reviewId, Long userId);
}
