package com.acadevia.notification.dto.response;

import com.acadevia.notification.enums.NotificationCategory;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor @AllArgsConstructor
@Builder
public class PreferenceResponse {
    private Long id;
    private Long userId;
    private NotificationCategory category;
    private boolean emailEnabled;
    private boolean smsEnabled;
    private boolean pushEnabled;
    private LocalDateTime updatedAt;
}
