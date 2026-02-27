package com.acadevia.content.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TranslationCreateRequest {

    @NotBlank(message = "Content type is required")
    private String contentType;

    @NotNull(message = "Content ID is required")
    private Long contentId;

    @NotBlank(message = "Field name is required")
    @Size(max = 50)
    private String fieldName;

    @NotBlank(message = "Language code is required")
    @Size(max = 10)
    private String languageCode;

    @NotBlank(message = "Translated value is required")
    private String translatedValue;

    @Builder.Default
    private Boolean isAutoTranslated = false;
}
