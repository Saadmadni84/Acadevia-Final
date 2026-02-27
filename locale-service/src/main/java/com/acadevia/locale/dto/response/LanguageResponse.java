package com.acadevia.locale.dto.response;

import com.acadevia.locale.enums.TextDirection;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class LanguageResponse {
    private Long id;
    private String code;
    private String name;
    private String nativeName;
    private String script;
    private TextDirection direction;
    private String fontFamily;
    private Boolean isActive;
    private Double completionPercent;
}
