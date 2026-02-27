package com.acadevia.content.dto.request;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TranslationUpdateRequest {

    private String translatedValue;

    @Size(max = 10)
    private String languageCode;

    private Boolean isAutoTranslated;

    private Boolean isVerified;

    private Long verifiedBy;
}
