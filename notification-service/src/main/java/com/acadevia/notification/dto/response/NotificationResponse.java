package com.acadevia.notification.dto.response;

import com.acadevia.notification.enums.NotificationCategory;
import com.acadevia.notification.enums.NotificationStatus;
import com.acadevia.notification.enums.NotificationPriority;
import lombok.*;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor @AllArgsConstructor
@Builder
public class NotificationResponse {
    private Long id;
    private Long recipientId;
    private String subject;
    private String content;
    private NotificationCategory category;
    private NotificationStatus status;
    private NotificationPriority priority;
    private Map<String, Object> metadata;
    private String link;
    private boolean read;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
}
