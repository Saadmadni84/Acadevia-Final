package com.acadevia.locale.dto.response;

import lombok.*;
import java.util.List;
import java.util.Map;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class TranslationStatsResponse {
    private Integer totalLanguages;
    private Integer activeLanguages;
    private Integer totalTranslationKeys;
    private Double overallCompletion;
    private List<LanguageCompletion> languageCompletions;
    private Map<String, Integer> categoryKeyCount;

    @Data @Builder
    public static class LanguageCompletion {
        private String code;
        private String name;
        private String nativeName;
        private Integer totalKeys;
        private Integer translatedKeys;
        private Double completionPercent;
    }
}
