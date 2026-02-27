package com.acadevia.notification.dto.kafka;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor @AllArgsConstructor
@Builder
public class LeaderboardResetEvent {
    private String timeScope;
    private Long totalLeaderboardsReset;
    private Long totalParticipantsArchived;
    private LocalDateTime timestamp;
}
