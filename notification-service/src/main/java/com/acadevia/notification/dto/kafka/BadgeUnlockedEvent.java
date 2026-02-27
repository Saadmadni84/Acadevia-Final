package com.acadevia.notification.dto.kafka;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor @AllArgsConstructor
@Builder
public class BadgeUnlockedEvent {
    private Long userId;
    private Long badgeId;
    private String badgeName;
    private String badgeDescription;
    private String badgeIconUrl;
    private String badgeType;
    private LocalDateTime timestamp;
}
