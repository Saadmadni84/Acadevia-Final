package com.acadevia.auth.dto.request;

import com.acadevia.auth.util.ValidationConstants;
import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TeacherRegistrationRequest {
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
    @JsonAlias({"phoneNumber", "phone_number"})
    private String phone;

    @NotNull
    private Long schoolId;

    @NotNull
    private Long stateId;

    @NotNull
    private Long cityId;

    @Pattern(regexp = "^[0-9]{6}$", message = "PIN Code must contain exactly 6 digits")
    @JsonAlias({"pincode", "pin_code"})
    private String pinCode;

    private String preferredLanguage = "en";
    private String subject;
}
