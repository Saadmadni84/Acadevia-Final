package com.acadevia.admin.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class AnnouncementRequest {
    @NotBlank private String title;
    @NotBlank private String message;
    private String severity;
    private String targetAudience;
    private Boolean isPinned;
    private LocalDateTime expiresAt;
}
