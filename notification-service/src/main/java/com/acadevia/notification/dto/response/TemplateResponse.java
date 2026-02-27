package com.acadevia.notification.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor @AllArgsConstructor
@Builder
public class TemplateResponse {
    private Long id;
    private String templateCode;
    private String subject;
    private String body;
    private boolean active;
    private String version;
    private LocalDateTime updatedAt;
}
