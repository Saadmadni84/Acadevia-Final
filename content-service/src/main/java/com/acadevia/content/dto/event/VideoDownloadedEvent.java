package com.acadevia.content.dto.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VideoDownloadedEvent {

    private Long downloadId;
    private Long videoId;
    private Long userId;
    private Long lessonId;
    private Long courseId;
    private String quality;
    private BigDecimal fileSizeMb;
    private String deviceId;
    private String platform;
    private LocalDateTime completedAt;
    private String eventType;

    @Builder.Default
    private String source = "content-service";
}
