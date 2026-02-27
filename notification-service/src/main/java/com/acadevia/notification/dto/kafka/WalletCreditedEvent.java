package com.acadevia.notification.dto.kafka;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor @AllArgsConstructor
@Builder
public class WalletCreditedEvent {
    private Long userId;
    private Long amount;
    private Long balanceAfter;
    private String source;
    private String description;
    private LocalDateTime timestamp;
}
