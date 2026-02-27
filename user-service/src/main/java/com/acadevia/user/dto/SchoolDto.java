package com.acadevia.user.dto;

import com.acadevia.user.entity.enums.Board;
import com.acadevia.user.entity.enums.Medium;
import com.acadevia.user.entity.enums.SchoolType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SchoolDto {

    private Long id;

    @NotBlank(message = "School name is required")
    private String name;

    private String nameLocal;

    private String code;

    @NotNull(message = "State ID is required")
    private Long stateId;
    private String stateName;

    @NotNull(message = "City ID is required")
    private Long cityId;
    private String cityName;

    @NotBlank(message = "District is required")
    private String district;

    @NotNull(message = "Board is required")
    private Board board;

    @NotNull(message = "Medium is required")
    private Medium medium;

    private String mediumLanguage;
    private SchoolType schoolType;

    @NotBlank(message = "Address is required")
    private String address;

    @Pattern(regexp = "^[1-9][0-9]{5}$", message = "Invalid pincode")
    private String pincode;

    @Pattern(regexp = "\\d{10}", message = "Phone number must be 10 digits")
    private String phone;

    @Email(message = "Invalid email format")
    private String email;

    private String website;
    private String principalName;
    private Integer establishedYear;
    private String udiseCode;
    private String affiliationNo;

    private Integer totalStudents;
    private Integer totalTeachers;
    private Integer totalClassrooms;
    private String logoUrl;
    private Boolean isVerified;
    private Boolean isActive;
    private Long registeredBy;
    private LocalDateTime registeredAt;
    private LocalDateTime updatedAt;
}
