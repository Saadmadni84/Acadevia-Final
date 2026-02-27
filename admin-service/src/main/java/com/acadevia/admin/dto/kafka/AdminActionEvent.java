package com.acadevia.admin.dto.kafka;

import com.acadevia.admin.enums.AuditAction;
import lombok.*;
import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class AdminActionEvent {
    private Long adminUserId;
    private String adminEmail;
    private AuditAction action;
    private String targetType;
    private Long targetId;
    private String description;
    private LocalDateTime timestamp;
}
