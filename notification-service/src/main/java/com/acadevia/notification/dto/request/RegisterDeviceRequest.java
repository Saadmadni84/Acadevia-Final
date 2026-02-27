package com.acadevia.notification.dto.request;

import lombok.*;
import jakarta.validation.constraints.NotNull;

@Data
@NoArgsConstructor @AllArgsConstructor
@Builder
public class RegisterDeviceRequest {
    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Device token is required")
    private String deviceToken;

    @NotNull(message = "Device type is required")
    private String deviceType; // ios, android, web
}
