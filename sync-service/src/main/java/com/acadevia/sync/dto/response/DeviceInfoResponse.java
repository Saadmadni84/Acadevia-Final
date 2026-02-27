package com.acadevia.sync.dto.response;

import com.acadevia.sync.enums.SyncStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class DeviceInfoResponse {
    private String deviceId;
    private Long userId;
    private String deviceType;
    private SyncStatus status;
    private LocalDateTime lastActive;
}
