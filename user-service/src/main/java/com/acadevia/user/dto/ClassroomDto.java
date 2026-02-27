package com.acadevia.user.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
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
public class ClassroomDto {

    private Long id;

    @NotNull(message = "School ID is required")
    private Long schoolId;
    private String schoolName;

    @NotNull(message = "Class grade is required")
    @Min(value = 1, message = "Grade must be at least 1")
    @Max(value = 12, message = "Grade must be at most 12")
    private Integer classGrade;

    @NotBlank(message = "Section is required")
    private String section;

    @NotBlank(message = "Academic year is required")
    private String academicYear;

    private Long classTeacherId;
    private String classTeacherName;

    private Integer maxStudents;
    private Integer currentStudents;
    private String roomNumber;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
