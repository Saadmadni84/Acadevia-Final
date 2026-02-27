package com.acadevia.locale.dto.response;

import lombok.*;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class MissingTranslationsResponse {
    private String languageCode;
    private String languageName;
    private Integer totalMissing;
    private List<MissingKey> missingKeys;

    @Data @Builder
    public static class MissingKey {
        private String keyName;
        private String category;
        private String defaultValue;
    }
}
