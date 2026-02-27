package com.acadevia.notification.dto.kafka;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor @AllArgsConstructor
@Builder
public class XpAwardedEvent {
    private Long userId;
    private Integer xpAmount;
    private String xpType;
    private String subject;
    private String sourceEvent;
    private Long sourceId;
    private LocalDateTime timestamp;
}
