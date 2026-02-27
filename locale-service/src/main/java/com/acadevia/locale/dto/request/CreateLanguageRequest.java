package com.acadevia.locale.dto.request;
import com.acadevia.locale.enums.TextDirection;
import jakarta.validation.constraints.*;
import lombok.*;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CreateLanguageRequest {
    @NotBlank private String code;
    @NotBlank private String name;
    @NotBlank private String nativeName;
    private String script;
    private TextDirection direction;
    private String fontFamily;
    private String phase;
}
