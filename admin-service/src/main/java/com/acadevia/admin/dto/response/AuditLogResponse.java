package com.acadevia.admin.dto.response;
import com.acadevia.admin.enums.AuditAction;
import lombok.*;
import java.time.LocalDateTime;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class AuditLogResponse {
    private Long id;
    private String adminEmail;
    private AuditAction action;
    private String targetType;
    private Long targetId;
    private String description;
    private String ipAddress;
    private LocalDateTime createdAt;
}
