package com.acadevia.user.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeacherMappingDto {

    private Long id;

    @NotNull(message = "Teacher ID is required")
    private Long teacherId;

    @NotNull(message = "School ID is required")
    private Long schoolId;
    private String schoolName;

    private List<String> subjects;
    private String designation;
    private String employeeId;
    private Boolean isPrimarySchool;
    private Boolean isActive;
    private LocalDateTime joinedAt;
    private LocalDateTime leftAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
