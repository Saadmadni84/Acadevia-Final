package com.acadevia.course.dto.response;

import lombok.AllArgsConstructor;
import lombok.experimental.SuperBuilder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class CourseCardResponse {
    private Long id;
    private String title;
    private String shortDescription;
    private String category;
    private String subject;
    private Integer classGrade;
    private String board;
    private String language;
    private String thumbnailUrl;
    private Long teacherId;
    private String teacherName;
    private String difficultyLevel;
    private String status;
    private Integer xpReward;
    private Integer estimatedHours;
    private Boolean isFree;
    private BigDecimal price;
    private Integer totalEnrolled;
    private Double avgRating;
    private Integer totalRatings;
    private Integer totalLessons;
    private Integer totalDurationMin;
    private Boolean isFavorited;
    private Boolean isEnrolled;
    private Double enrollmentProgress;
    private LocalDateTime publishedAt;
}
