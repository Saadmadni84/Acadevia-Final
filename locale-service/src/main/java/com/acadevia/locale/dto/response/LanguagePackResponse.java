package com.acadevia.locale.dto.response;

import com.acadevia.locale.enums.TextDirection;
import lombok.*;

import java.util.Map;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class LanguagePackResponse {
    private String languageCode;
    private String languageName;
    private String nativeName;
    private String script;
    private TextDirection direction;
    private String fontFamily;
    private Map<String, Map<String, String>> categorizedTranslations;
    private Integer totalKeys;
    private Double completionPercent;
    private String version;
    private String generatedAt;
}
