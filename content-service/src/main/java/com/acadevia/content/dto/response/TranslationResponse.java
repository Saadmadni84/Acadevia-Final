package com.acadevia.content.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TranslationResponse {

    private Long id;
    private String contentType;
    private Long contentId;
    private String fieldName;
    private String languageCode;
    private String translatedValue;
    private Boolean isAutoTranslated;
    private Boolean isVerified;
    private Long verifiedBy;
    private LocalDateTime verifiedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
