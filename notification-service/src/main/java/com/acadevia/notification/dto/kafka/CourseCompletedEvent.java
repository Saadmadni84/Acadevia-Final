package com.acadevia.notification.dto.kafka;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor @AllArgsConstructor
@Builder
public class CourseCompletedEvent {
    private Long userId;
    private Long courseId;
    private String courseName;
    private String category;
    private Integer xpAwarded;
    private LocalDateTime timestamp;
}
