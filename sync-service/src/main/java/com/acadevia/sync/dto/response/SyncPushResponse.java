package com.acadevia.sync.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SyncPushResponse {
    private String status;
    private String batchId;
    private Integer totalReceived;
    private Integer totalProcessed;
    private Integer totalConflicts;
    private Integer totalFailed;
    private Integer successCount;
    private Integer failCount;
    private List<SyncItemResult> results;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SyncItemResult {
        private String entityId;
        private String status;
        private String message;
    }
}
