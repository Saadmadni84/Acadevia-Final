package com.acadevia.admin.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class FeatureFlagRequest {
    @NotBlank private String flagKey;
    private String displayName;
    private String description;
    private Boolean isEnabled;
    private String scope;
}
