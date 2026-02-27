package com.acadevia.admin.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class SchoolOnboardRequest {
    @NotBlank private String name;
    private String nameLocal;
    @NotBlank private String stateId;
    @NotBlank private String cityId;
    @NotBlank private String board;
    @NotBlank private String mediumLanguageCode;
    private String schoolCode;
    private String address;
    private String phone;
    private String email;
    private String principalName;
    private Integer establishedYear;
}
