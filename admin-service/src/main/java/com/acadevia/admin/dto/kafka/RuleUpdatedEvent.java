package com.acadevia.admin.dto.kafka;
import lombok.*;
import java.time.LocalDateTime;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class RuleUpdatedEvent {
    private String ruleType;
    private Integer oldValue;
    private Integer newValue;
    private Long updatedBy;
    private LocalDateTime timestamp;
}
