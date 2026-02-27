package com.acadevia.course.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class CreateCourseRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must be less than 255 characters")
    private String title;

    private String description;

    @Size(max = 500, message = "Short description must be less than 500 characters")
    private String shortDescription;

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Subject is required")
    private String subject;

    @NotNull(message = "Class grade is required")
    @Min(value = 1, message = "Class grade must be at least 1")
    @Max(value = 12, message = "Class grade must be at most 12")
    private Integer classGrade;

    @Builder.Default
    private String board = "ALL";

    @Builder.Default
    private String language = "en";

    private String thumbnailUrl;

    private String previewVideoUrl;

    @Builder.Default
    private String difficultyLevel = "BEGINNER";

    @Builder.Default
    private Integer xpReward = 100;

    private Integer estimatedHours;

    @Builder.Default
    private Boolean isFree = true;

    private BigDecimal price;

    @Builder.Default
    private Integer maxEnrollment = 0;

    private List<String> tags;

    private List<String> prerequisites;

    private List<String> learningOutcomes;

    private String targetAudience;
}
