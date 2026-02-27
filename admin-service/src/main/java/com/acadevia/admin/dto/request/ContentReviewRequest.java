package com.acadevia.admin.dto.request;

import com.acadevia.admin.enums.ReviewStatus;
import jakarta.validation.constraints.*;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ContentReviewRequest {
    @NotNull private Long reviewId;
    @NotNull private ReviewStatus decision;
    private String reviewNotes;
    private Integer qualityScore;
}
