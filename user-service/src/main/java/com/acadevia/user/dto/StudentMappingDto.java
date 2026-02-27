package com.acadevia.user.dto;

import jakarta.validation.constraints.NotBlank;
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
public class StudentMappingDto {

    private Long id;

    @NotNull(message = "Student ID is required")
    private Long studentId;

    @NotNull(message = "Classroom ID is required")
    private Long classroomId;
    private String classroomInfo;

    @NotNull(message = "School ID is required")
    private Long schoolId;
    private String schoolName;

    private String rollNumber;

    @NotBlank(message = "Student School ID is required")
    private String studentSchoolId;

    @NotBlank(message = "Academic year is required")
    private String academicYear;

    private Boolean isActive;
    private LocalDateTime enrolledAt;
    private LocalDateTime updatedAt;
}
