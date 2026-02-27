package com.acadevia.admin.dto.response;
import com.acadevia.admin.enums.ReviewStatus;
import lombok.*;
import java.time.LocalDateTime;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ContentReviewResponse {
    private Long id;
    private String contentType;
    private Long contentId;
    private String contentTitle;
    private String submitterName;
    private ReviewStatus status;
    private String reviewerName;
    private String reviewNotes;
    private Integer qualityScore;
    private LocalDateTime reviewedAt;
    private LocalDateTime createdAt;
}
