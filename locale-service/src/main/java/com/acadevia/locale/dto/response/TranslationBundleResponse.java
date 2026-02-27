package com.acadevia.locale.dto.response;

import com.acadevia.locale.enums.TextDirection;
import lombok.*;

import java.util.Map;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class TranslationBundleResponse {
    private String languageCode;
    private String languageName;
    private String nativeName;
    private TextDirection direction;
    private String fontFamily;
    private Map<String, String> translations;
    private Integer totalKeys;
    private String generatedAt;
}
