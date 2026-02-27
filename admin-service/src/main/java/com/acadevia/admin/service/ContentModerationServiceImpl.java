package com.acadevia.admin.service;

import com.acadevia.admin.dto.kafka.ContentApprovedEvent;
import com.acadevia.admin.dto.request.ContentReviewRequest;
import com.acadevia.admin.dto.response.ContentReviewResponse;
import com.acadevia.admin.entity.ContentReview;
import com.acadevia.admin.enums.AuditAction;
import com.acadevia.admin.enums.ReviewStatus;
import com.acadevia.admin.kafka.producer.AdminEventProducer;
import com.acadevia.admin.repository.ContentReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContentModerationServiceImpl implements ContentModerationService {

    private final ContentReviewRepository reviewRepo;
    private final AuditService auditService;
    private final AdminEventProducer eventProducer;

    @Override
    public Page<ContentReviewResponse> getPendingReviews(int page, int size) {
        return reviewRepo.findByStatusOrderByCreatedAtAsc(ReviewStatus.PENDING, PageRequest.of(page, size))
                .map(this::toResponse);
    }

    @Override
    public Page<ContentReviewResponse> getReviewsByType(String contentType, ReviewStatus status, int page, int size) {
        return reviewRepo.findByContentTypeAndStatusOrderByCreatedAtAsc(contentType, status, PageRequest.of(page, size))
                .map(this::toResponse);
    }

    @Override
    @Transactional
    public ContentReviewResponse reviewContent(ContentReviewRequest request, Long adminUserId) {
        ContentReview review = reviewRepo.findById(request.getReviewId())
                .orElseThrow(() -> new RuntimeException("Review not found: " + request.getReviewId()));

        review.setStatus(request.getDecision());
        review.setReviewedBy(adminUserId);
        review.setReviewNotes(request.getReviewNotes());
        review.setQualityScore(request.getQualityScore());
        review.setReviewedAt(LocalDateTime.now());

        review = reviewRepo.save(review);

        AuditAction auditAction = request.getDecision() == ReviewStatus.APPROVED
                ? AuditAction.COURSE_APPROVED : AuditAction.COURSE_REJECTED;

        auditService.log(adminUserId, null, auditAction,
                review.getContentType(), review.getContentId(),
                "Content " + request.getDecision() + ": " + review.getContentTitle(),
                null, null, null, null);

        if (request.getDecision() == ReviewStatus.APPROVED || request.getDecision() == ReviewStatus.REJECTED) {
            eventProducer.publishContentApproved(ContentApprovedEvent.builder()
                    .contentType(review.getContentType())
                    .contentId(review.getContentId())
                    .contentTitle(review.getContentTitle())
                    .status(request.getDecision().name())
                    .reviewedBy(adminUserId)
                    .timestamp(LocalDateTime.now())
                    .build());
        }

        log.info("Content reviewed: type={}, id={}, decision={}", review.getContentType(),
                review.getContentId(), request.getDecision());

        return toResponse(review);
    }

    @Override
    @Transactional
    public void submitForReview(String contentType, Long contentId, String contentTitle,
                                 Long submittedBy, String submitterName) {
        ContentReview review = ContentReview.builder()
                .contentType(contentType)
                .contentId(contentId)
                .contentTitle(contentTitle)
                .submittedBy(submittedBy)
                .submitterName(submitterName)
                .status(ReviewStatus.PENDING)
                .build();

        reviewRepo.save(review);
    }

    @Override
    public Long countPendingReviews() {
        return reviewRepo.countByStatus(ReviewStatus.PENDING);
    }

    private ContentReviewResponse toResponse(ContentReview r) {
        return ContentReviewResponse.builder()
                .id(r.getId()).contentType(r.getContentType()).contentId(r.getContentId())
                .contentTitle(r.getContentTitle()).submitterName(r.getSubmitterName())
                .status(r.getStatus()).reviewerName(r.getReviewerName())
                .reviewNotes(r.getReviewNotes()).qualityScore(r.getQualityScore())
                .reviewedAt(r.getReviewedAt()).createdAt(r.getCreatedAt()).build();
    }
}
