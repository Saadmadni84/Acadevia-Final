package com.acadevia.course.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PopularCourseResponse {
    private Long id;
    private String title;
    private String category;
    private String subject;
    private Integer studentsEnrolled;
    private Double rating;
    private Double progressPercentage;
}
