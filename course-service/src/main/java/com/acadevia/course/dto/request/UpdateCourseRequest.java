package com.acadevia.course.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCourseRequest {

    @Size(max = 255)
    private String title;

    private String description;

    @Size(max = 500)
    private String shortDescription;

    private String category;

    private String subject;

    @Min(1)
    @Max(12)
    private Integer classGrade;

    private String board;

    private String language;

    private String thumbnailUrl;

    private String previewVideoUrl;

    private String difficultyLevel;

    private Integer xpReward;

    private Integer estimatedHours;

    private Boolean isFree;

    private BigDecimal price;

    private Integer maxEnrollment;

    private List<String> tags;

    private List<String> prerequisites;

    private List<String> learningOutcomes;

    private String targetAudience;
}
