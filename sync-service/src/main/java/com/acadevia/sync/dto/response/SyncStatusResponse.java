package com.acadevia.sync.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class SyncStatusResponse {
    private String deviceId;
    private String lastSyncStatus;
    private LocalDateTime lastSyncTime;
    private Integer pendingUploads;
    private Integer pendingDownloads;
}
