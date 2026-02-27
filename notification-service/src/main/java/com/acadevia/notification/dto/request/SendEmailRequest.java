package com.acadevia.notification.dto.request;

import lombok.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import java.util.Map;

@Data
@NoArgsConstructor @AllArgsConstructor
@Builder
public class SendEmailRequest {
    @NotNull(message = "Recipient email is required")
    @Email(message = "Invalid email format")
    private String to;

    @NotNull(message = "Subject is required")
    private String subject;

    @NotNull(message = "Template ID is required")
    private String templateId;

    private Map<String, Object> variables;
    
    private Long userId; // Optional, for logging
}
