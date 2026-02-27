package com.acadevia.course.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseStatsResponse {
    private Long courseId;
    private String courseTitle;
    private Integer totalEnrolled;
    private Integer activeStudents;
    private Integer completedStudents;
    private Integer droppedStudents;
    private Double avgProgress;
    private Double completionRate;
    private Double avgRating;
    private Integer totalReviews;
    private Map<Integer, Integer> ratingDistribution;
    private Double avgTimeToCompletionHours;
    private Integer totalRevenue;
    private List<EnrollmentTrend> enrollmentTrend;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EnrollmentTrend {
        private String date;
        private Integer enrollments;
    }
}
