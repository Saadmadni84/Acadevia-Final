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
public class CourseRatedEvent {
    private Long courseId;
    private Long userId;
    private Integer rating;
    private Double newAvgRating;
    private LocalDateTime ratedAt;
}
