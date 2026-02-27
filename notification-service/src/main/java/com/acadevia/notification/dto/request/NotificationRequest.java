package com.acadevia.notification.dto.request;

import com.acadevia.notification.enums.NotificationCategory;
import com.acadevia.notification.enums.NotificationPriority;
import lombok.*;
import jakarta.validation.constraints.NotNull;
import java.util.Map;

@Data
@NoArgsConstructor @AllArgsConstructor
@Builder
public class NotificationRequest {
    @NotNull(message = "Recipient ID is required")
    private Long recipientId;

    @NotNull(message = "Category is required")
    private NotificationCategory category;

    @NotNull(message = "Subject is required")
    private String subject;

    @NotNull(message = "Content is required")
    private String content;

    @Builder.Default
    private NotificationPriority priority = NotificationPriority.MEDIUM;
    
    private Map<String, Object> metadata;

    private String link;
}
