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
public class CoursePublishedEvent {
    private Long courseId;
    private String courseTitle;
    private Long teacherId;
    private String subject;
    private Integer classGrade;
    private String board;
    private String language;
    private LocalDateTime publishedAt;
}
