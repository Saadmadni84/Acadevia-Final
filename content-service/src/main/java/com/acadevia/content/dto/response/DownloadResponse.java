package com.acadevia.content.dto.response;

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
public class DownloadResponse {

    private Long id;
    private Long videoId;
    private Long userId;
    private Long lessonId;
    private Long courseId;
    private String quality;
    private BigDecimal fileSizeMb;
    private String downloadUrl;
    private String downloadStatus;
    private Double downloadProgressPct;
    private String errorMessage;
    private Integer retryCount;
    private Integer maxRetries;
    private String downloadToken;
    private LocalDateTime tokenExpiresAt;
    private LocalDateTime expiresAt;
    private LocalDateTime requestedAt;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private String deviceId;
    private String deviceName;
    private String platform;
}
