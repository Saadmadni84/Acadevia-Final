package com.acadevia.auth.dto.request;

import com.acadevia.auth.util.ValidationConstants;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SchoolAdminRegistrationRequest {
    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

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
    private Long schoolId;

    @NotNull
    private Long stateId;

    @NotNull
    private Long cityId;

    private String preferredLanguage = "en";
}
