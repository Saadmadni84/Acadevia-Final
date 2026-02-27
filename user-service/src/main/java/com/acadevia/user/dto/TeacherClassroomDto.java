package com.acadevia.user.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeacherClassroomDto {

    private Long id;

    @NotNull(message = "Teacher ID is required")
    private Long teacherId;

    @NotNull(message = "Classroom ID is required")
    private Long classroomId;
    private String classroomInfo; // e.g., "10-A"

    @NotNull(message = "School ID is required")
    private Long schoolId;

    @NotNull(message = "Subject is required")
    private String subject;

    private Boolean isClassTeacher;
    private Boolean isActive;
    private LocalDateTime assignedAt;
    private LocalDateTime updatedAt;
}
