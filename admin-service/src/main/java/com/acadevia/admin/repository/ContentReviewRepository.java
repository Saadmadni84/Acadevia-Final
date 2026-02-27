package com.acadevia.admin.repository;
import com.acadevia.admin.entity.ContentReview;
import com.acadevia.admin.enums.ReviewStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface ContentReviewRepository extends JpaRepository<ContentReview, Long> {
    Page<ContentReview> findByStatusOrderByCreatedAtAsc(ReviewStatus status, Pageable pageable);
    Page<ContentReview> findByContentTypeAndStatusOrderByCreatedAtAsc(String type, ReviewStatus status, Pageable pageable);
    Long countByStatus(ReviewStatus status);
}
