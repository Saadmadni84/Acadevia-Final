package com.acadevia.admin.dto.kafka;
import lombok.*;
import java.time.LocalDateTime;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class SchoolOnboardedEvent {
    private Long schoolId;
    private String schoolName;
    private String stateId;
    private String cityId;
    private String board;
    private String languageCode;
    private LocalDateTime timestamp;
}
