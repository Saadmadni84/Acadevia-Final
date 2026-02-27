package com.acadevia.notification.dto.kafka;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor @AllArgsConstructor
@Builder
public class RankChangedEvent {
    private Long userId;
    private String displayName;
    private String geoScope;
    private String scopeId;
    private String timeScope;
    private Integer grade;
    private Long oldRank;
    private Long newRank;
    private Long totalXp;
    private String direction;
    private LocalDateTime timestamp;
}
