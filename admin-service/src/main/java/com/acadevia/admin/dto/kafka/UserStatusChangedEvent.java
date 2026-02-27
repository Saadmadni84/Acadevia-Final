package com.acadevia.admin.dto.kafka;
import lombok.*;
import java.time.LocalDateTime;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class UserStatusChangedEvent {
    private Long userId;
    private String action;
    private String reason;
    private Long changedBy;
    private LocalDateTime timestamp;
}
