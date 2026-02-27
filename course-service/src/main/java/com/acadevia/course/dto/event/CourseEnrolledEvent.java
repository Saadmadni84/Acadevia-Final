package com.acadevia.course.dto.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseEnrolledEvent {
    private Long userId;
    private Long courseId;
    private String courseTitle;
    private String subject;
    private String category;
    private Integer classGrade;
    private String board;
    private LocalDateTime enrolledAt;
}
