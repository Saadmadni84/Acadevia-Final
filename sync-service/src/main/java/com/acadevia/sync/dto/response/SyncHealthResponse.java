package com.acadevia.sync.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SyncHealthResponse {
    private String status;
    private Integer queueDepth;
    private Integer activeDownloads;
}
