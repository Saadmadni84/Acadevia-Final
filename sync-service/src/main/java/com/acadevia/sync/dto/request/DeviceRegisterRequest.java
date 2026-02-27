package com.acadevia.sync.dto.request;

import com.acadevia.sync.enums.DeviceType;
import lombok.Data;

@Data
public class DeviceRegisterRequest {
    private String deviceId;
    private Long userId;
    private DeviceType deviceType;
    private String fcmToken;
    private String appVersion;
    private String osVersion;
    private String modelName;
}
