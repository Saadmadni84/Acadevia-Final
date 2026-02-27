package com.acadevia.notification.dto.kafka;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor @AllArgsConstructor
@Builder
public class AssignmentCreatedEvent {
    private Long assignmentId;
    private Long classroomId;
    private Long teacherId;
    private String teacherName;
    private String title;
    private String subject;
    private LocalDateTime dueDate;
    private List<Long> studentIds;
    private LocalDateTime timestamp;
}
