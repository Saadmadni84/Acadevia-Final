package com.acadevia.sync.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class BatchSyncRequest {
    private String sessionId; // Optional
    private List<SyncPushRequest> changes;
}
