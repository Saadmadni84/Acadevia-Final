package com.acadevia.admin.dto.response;
import lombok.*;
import java.time.LocalDateTime;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class AnnouncementResponse {
    private Long id;
    private String title;
    private String message;
    private String severity;
    private String targetAudience;
    private Boolean isActive;
    private Boolean isPinned;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
}
