package com.acadevia.locale.dto.response;

import com.acadevia.locale.enums.ContentType;
import com.acadevia.locale.enums.TranslationStatus;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ContentTranslationResponse {
    private Long id;
    private ContentType contentType;
    private Long contentId;
    private String languageCode;
    private String languageName;
    private String translatedTitle;
    private String translatedDescription;
    private String translatedContent;
    private TranslationStatus status;
}
