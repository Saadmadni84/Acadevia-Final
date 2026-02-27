package com.acadevia.admin.dto.response;
import lombok.*;
import java.time.LocalDateTime;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class FeatureFlagResponse {
    private Long id;
    private String flagKey;
    private String displayName;
    private String description;
    private Boolean isEnabled;
    private String scope;
    private LocalDateTime updatedAt;
}
