package com.acadevia.locale.dto.request;
import jakarta.validation.constraints.*;
import lombok.*;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CreateTranslationRequest {
    @NotBlank private String keyName;
    @NotBlank private String languageCode;
    @NotBlank private String translatedText;
}
