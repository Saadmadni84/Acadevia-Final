package com.acadevia.sync.dto.request;

import com.acadevia.sync.enums.NetworkType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SyncPushRequest {
    private String deviceId;
    private NetworkType networkType;
    private Double bandwidthKbps;
    private String appVersion;
    private List<SyncItem> items;
}
