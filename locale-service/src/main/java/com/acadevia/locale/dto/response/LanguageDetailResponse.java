package com.acadevia.locale.dto.response;

import com.acadevia.locale.enums.LanguagePhase;
import com.acadevia.locale.enums.TextDirection;
import lombok.*;

import java.util.Map;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class LanguageDetailResponse {
    private Long id;
    private String code;
    private String name;
    private String nativeName;
    private String script;
    private TextDirection direction;
    private String fontFamily;
    private LanguagePhase phase;
    private Boolean isActive;
    private Integer totalKeys;
    private Integer translatedKeys;
    private Double completionPercent;
    private Map<String, Integer> categoryBreakdown;
}
