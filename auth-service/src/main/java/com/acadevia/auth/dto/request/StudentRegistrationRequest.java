package com.acadevia.auth.dto.request;

import com.acadevia.auth.util.ValidationConstants;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class StudentRegistrationRequest {
    @NotBlank
    @Size(min = ValidationConstants.MIN_NAME_LENGTH, max = ValidationConstants.MAX_NAME_LENGTH)
    private String firstName;

    @NotBlank
    @Size(min = ValidationConstants.MIN_NAME_LENGTH, max = ValidationConstants.MAX_NAME_LENGTH)
    private String lastName;

    private String firstNameLocal;
    private String lastNameLocal;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Size(min = ValidationConstants.MIN_PASSWORD_LENGTH, max = ValidationConstants.MAX_PASSWORD_LENGTH)
    @Pattern(regexp = ValidationConstants.PASSWORD_REGEX, message = ValidationConstants.PASSWORD_MESSAGE)
    private String password;

    @NotBlank
    private String confirmPassword;

    @NotNull
    private String phone;

    @NotNull
    @Min(ValidationConstants.MIN_CLASS_GRADE)
    @Max(ValidationConstants.MAX_CLASS_GRADE)
    private Integer classGrade;

    @NotNull
    private Long schoolId;

    @NotNull
    private Long stateId;

    @NotNull
    private Long cityId;

    @NotBlank
    private String studentSchoolId;

    private String preferredLanguage = "en";
    private String board;
    private String medium;
}
