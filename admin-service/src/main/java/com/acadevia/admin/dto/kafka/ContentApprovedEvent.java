package com.acadevia.admin.dto.kafka;
import lombok.*;
import java.time.LocalDateTime;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ContentApprovedEvent {
    private String contentType;
    private Long contentId;
    private String contentTitle;
    private String status;
    private Long reviewedBy;
    private LocalDateTime timestamp;
}
