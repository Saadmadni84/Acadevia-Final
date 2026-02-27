package com.acadevia.notification.dto.response;

import com.acadevia.notification.enums.EmailStatus;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor @AllArgsConstructor
@Builder
public class EmailStatusResponse {
    private Long id;
    private String recipient;
    private String subject;
    private EmailStatus status;
    private String errorMessage;
    private LocalDateTime sentAt;
}
