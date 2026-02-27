package com.acadevia.course.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class CourseDetailResponse extends CourseCardResponse {
    private String description;
    private String previewVideoUrl;
    private Long schoolId;
    private Integer totalModules;
    private Integer totalCompletions;
    private Double completionRate;
    private List<String> tags;
    private List<String> prerequisites;
    private List<String> learningOutcomes;
    private String targetAudience;
    private List<ModuleDetailResponse> modules;
    private ReviewSummary reviewSummary;
    private EnrollmentInfo enrollmentInfo;
    private LocalDateTime createdAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReviewSummary {
        private Double avgRating;
        private Integer totalReviews;
        private Map<Integer, Integer> ratingDistribution;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EnrollmentInfo {
        private Long enrollmentId;
        private String status;
        private Double progressPct;
        private Integer completedLessons;
        private Integer totalLessons;
        private LocalDateTime enrolledAt;
        private Long lastLessonId;
    }
}
