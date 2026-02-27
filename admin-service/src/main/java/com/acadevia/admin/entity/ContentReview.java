package com.acadevia.admin.entity;

import com.acadevia.admin.enums.ReviewStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "content_reviews", indexes = {
        @Index(name = "idx_cr_status", columnList = "status"),
        @Index(name = "idx_cr_content", columnList = "contentType, contentId")
})
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ContentReview {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 30)
    private String contentType;

    @Column(nullable = false)
    private Long contentId;

    @Column(length = 255)
    private String contentTitle;

    @Column
    private Long submittedBy;

    @Column(length = 200)
    private String submitterName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ReviewStatus status = ReviewStatus.PENDING;

    @Column
    private Long reviewedBy;

    @Column(length = 200)
    private String reviewerName;

    @Column(columnDefinition = "TEXT")
    private String reviewNotes;

    @Column
    private Integer qualityScore;

    private LocalDateTime reviewedAt;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
