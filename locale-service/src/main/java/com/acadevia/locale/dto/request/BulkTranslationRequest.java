package com.acadevia.locale.dto.request;
import jakarta.validation.constraints.*;
import lombok.*;
import java.util.Map;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class BulkTranslationRequest {
    @NotBlank private String languageCode;
    @NotEmpty private Map<String, String> translations;
}
