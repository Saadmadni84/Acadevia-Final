package com.acadevia.admin.dto.kafka;
import lombok.*;
import java.time.LocalDateTime;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class AnnouncementBroadcastEvent {
    private Long announcementId;
    private String title;
    private String message;
    private String severity;
    private String targetAudience;
    private LocalDateTime timestamp;
}
