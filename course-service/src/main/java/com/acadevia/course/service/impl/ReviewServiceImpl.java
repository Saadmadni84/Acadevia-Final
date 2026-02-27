package com.acadevia.course.service.impl;

import com.acadevia.course.dto.event.CourseRatedEvent;
import com.acadevia.course.dto.request.CreateReviewRequest;
import com.acadevia.course.dto.request.UpdateReviewRequest;
import com.acadevia.course.dto.response.MessageResponse;
import com.acadevia.course.dto.response.PagedResponse;
import com.acadevia.course.dto.response.ReviewResponse;
import com.acadevia.course.entity.Course;
import com.acadevia.course.entity.CourseReview;
import com.acadevia.course.entity.Enrollment;
import com.acadevia.course.exception.ResourceNotFoundException;
import com.acadevia.course.exception.UnauthorizedException;
import com.acadevia.course.mapper.ReviewMapper;
import com.acadevia.course.repository.CourseRepository;
import com.acadevia.course.repository.EnrollmentRepository;
import com.acadevia.course.repository.CourseReviewRepository;
import com.acadevia.course.service.KafkaEventPublisher;
import com.acadevia.course.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final CourseReviewRepository reviewRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ReviewMapper reviewMapper;
    private final KafkaEventPublisher eventPublisher;

    @Override
    @Transactional
    public ReviewResponse createReview(Long courseId, CreateReviewRequest request, Long userId) {
        if (!enrollmentRepository.existsByUserIdAndCourseId(userId, courseId)) {
            throw new UnauthorizedException("You must be enrolled in the course to review it");
        }
        
        if (reviewRepository.existsByUserIdAndCourseId(userId, courseId)) {
             throw new IllegalStateException("You have already reviewed this course. Update your existing review instead.");
        }

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));

        Enrollment enrollment = enrollmentRepository.findByUserIdAndCourseId(userId, courseId).orElse(null);

        CourseReview review = CourseReview.builder()
                .rating(request.getRating())
                .title(request.getTitle())
                .reviewText(request.getReviewText())
                .courseId(courseId)
                .userId(userId)
                .enrollmentId(enrollment != null ? enrollment.getId() : null)
                .build();
        
        CourseReview savedReview = reviewRepository.save(review);
        
        updateCourseRating(course, request.getRating());
        
        eventPublisher.publishCourseRated(CourseRatedEvent.builder()
                .courseId(courseId)
                .userId(userId)
                .rating(request.getRating())
                .newAvgRating(course.getAvgRating())
                .ratedAt(LocalDateTime.now())
                .build());

        return reviewMapper.toResponse(savedReview);
    }

    @Override
    @Transactional
    public ReviewResponse updateReview(Long courseId, UpdateReviewRequest request, Long userId) {
        CourseReview review = reviewRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "courseId", courseId));

        int oldRating = review.getRating();
        if (request.getRating() != null) review.setRating(request.getRating());
        if (request.getTitle() != null) review.setTitle(request.getTitle());
        if (request.getReviewText() != null) review.setReviewText(request.getReviewText());
        
        CourseReview updatedReview = reviewRepository.save(review);
        
        // If rating changed, update course aggregate
        if (oldRating != request.getRating()) {
            recalculateCourseRating(courseId);
        }

        return reviewMapper.toResponse(updatedReview);
    }

    @Override
    @Transactional
    public MessageResponse deleteReview(Long courseId, Long userId) {
        CourseReview review = reviewRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "courseId", courseId));
        
        reviewRepository.delete(review);
        recalculateCourseRating(courseId);
        
        return MessageResponse.builder().message("Review deleted successfully").success(true).timestamp(LocalDateTime.now()).build();
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<ReviewResponse> getCourseReviews(Long courseId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<CourseReview> reviews = reviewRepository.findByCourseIdAndIsVisibleTrueOrderByCreatedAtDesc(courseId, pageable);
        
        return PagedResponse.<ReviewResponse>builder()
                .content(reviews.getContent().stream().map(reviewMapper::toResponse).collect(Collectors.toList()))
                .page(reviews.getNumber())
                .size(reviews.getSize())
                .totalElements(reviews.getTotalElements())
                .totalPages(reviews.getTotalPages())
                .first(reviews.isFirst())
                .last(reviews.isLast())
                .build();
    }

    @Override
    @Transactional
    public MessageResponse replyToReview(Long reviewId, String reply, Long teacherId) {
        CourseReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));
        
        Course course = courseRepository.findById(review.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", review.getCourseId()));
        
        if (!course.getTeacherId().equals(teacherId)) {
            throw new UnauthorizedException("Only the course instructor can reply to reviews");
        }
        
        review.setTeacherReply(reply);
        review.setTeacherRepliedAt(LocalDateTime.now());
        reviewRepository.save(review);
        
        return MessageResponse.builder().message("Reply added successfully").success(true).timestamp(LocalDateTime.now()).build();
    }

    @Override
    @Transactional
    public MessageResponse markReviewHelpful(Long reviewId, Long userId) {
        // In a real app we would track 'who' marked it helpful in a separate table to prevent duplicates
        // For simple impl, just increment count
        CourseReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));
        
        review.setHelpfulCount(review.getHelpfulCount() + 1);
        reviewRepository.save(review);
        
        return MessageResponse.builder().message("Marked as helpful").success(true).timestamp(LocalDateTime.now()).build();
    }

    private void updateCourseRating(Course course, int newRating) {
        // Simplified incremental update
        double totalRatingPoints = (course.getAvgRating() * course.getTotalReviews()) + newRating;
        int newCount = course.getTotalReviews() + 1;
        course.setTotalReviews(newCount);
        course.setAvgRating(totalRatingPoints / newCount);
        courseRepository.save(course);
    }

    private void recalculateCourseRating(Long courseId) {
        Course course = courseRepository.findById(courseId).orElseThrow();
        Double avg = reviewRepository.avgRatingByCourseId(courseId);
        Integer count = reviewRepository.countByCourseId(courseId);
        
        course.setAvgRating(avg != null ? avg : 0.0);
        course.setTotalReviews(count != null ? count : 0);
        courseRepository.save(course);
    }
}
