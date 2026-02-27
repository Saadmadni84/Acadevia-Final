package com.acadevia.notification.dto.request;

import com.acadevia.notification.enums.NotificationCategory;
import lombok.*;
import jakarta.validation.constraints.NotNull;

@Data
@NoArgsConstructor @AllArgsConstructor
@Builder
public class UpdatePreferenceRequest {
    @NotNull(message = "Category is required")
    private NotificationCategory category;

    private boolean emailEnabled;
    private boolean smsEnabled;
    private boolean pushEnabled;
}
