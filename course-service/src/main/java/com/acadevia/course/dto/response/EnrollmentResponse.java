package com.acadevia.course.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnrollmentResponse {
    private Long id;
    private Long userId;
    private Long courseId;
    private String courseTitle;
    private String courseThumbnail;
    private String courseSubject;
    private Integer courseClassGrade;
    private String status;
    private Double progressPct;
    private Integer completedLessons;
    private Integer totalLessons;
    private Integer totalTimeSpentMin;
    private Integer xpEarned;
    private Long lastLessonId;
    private String lastLessonTitle;
    private LocalDateTime enrolledAt;
    private LocalDateTime lastAccessedAt;
    private LocalDateTime completedAt;
    private String certificateId;
    private String certificateUrl;
}
