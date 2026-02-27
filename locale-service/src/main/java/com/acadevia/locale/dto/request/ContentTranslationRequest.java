package com.acadevia.locale.dto.request;
import com.acadevia.locale.enums.ContentType;
import jakarta.validation.constraints.*;
import lombok.*;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ContentTranslationRequest {
    @NotNull private ContentType contentType;
    @NotNull private Long contentId;
    @NotBlank private String languageCode;
    private String translatedTitle;
    private String translatedDescription;
    private String translatedContent;
}
