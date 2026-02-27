package com.acadevia.sync.dto.request;

import com.acadevia.sync.enums.NetworkType;
import lombok.Data;

@Data
public class BandwidthReportRequest {
    private NetworkType networkType;
    private Long bytesTransferred;
    private Long durationMs;
    private String timestamp;
}
