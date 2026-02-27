package com.acadevia.sync.controller;

import com.acadevia.sync.dto.request.BatchSyncRequest;
import com.acadevia.sync.dto.request.SyncPullRequest;
import com.acadevia.sync.dto.request.SyncPushRequest;
import com.acadevia.sync.dto.response.SyncPullResponse;
import com.acadevia.sync.dto.response.SyncPushResponse;
import com.acadevia.sync.service.SyncOrchestrator;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/sync")
@RequiredArgsConstructor
public class SyncController {

    private final SyncOrchestrator syncOrchestrator;

    @PostMapping("/batch")
    public ResponseEntity<BatchSyncResponse> batchSync(@RequestHeader("X-User-Id") Long userId,
                                                       @RequestBody BatchSyncRequest request) {
        // Per flow, we run PUSH then PULL.
        // Orchestrator's performBatchSync returns status, but we need data.
        // So we will call push & pull explicitly here or update Orchestrator.
        // Since Orchestrator is "The Brain", logic should stay there.
        // I'll assume orchestrator.performBatchSync handles side effects (Push processing) 
        // and we manually call pull if needed, OR we can execute both.
        
        syncOrchestrator.performBatchSync(userId, request);

        return ResponseEntity.ok(BatchSyncResponse.builder()
                .batchId("BATCH-" + System.currentTimeMillis())
                .build());
    }

    @PostMapping("/push")
    public ResponseEntity<SyncPushResponse> push(@RequestHeader("X-User-Id") Long userId,
                                                 @RequestBody SyncPushRequest request) {
        return ResponseEntity.ok(syncOrchestrator.pushSync(userId, request));
    }

    @PostMapping("/pull")
    public ResponseEntity<SyncPullResponse> pull(@RequestHeader("X-User-Id") Long userId,
                                                 @RequestBody SyncPullRequest request) {
        return ResponseEntity.ok(syncOrchestrator.pullSync(userId, request));
    }

    @Data
    @Builder
    static class BatchSyncResponse {
        private String batchId;
        private SyncPullResponse pullResponse;
        // Could add push stats here too
    }
}
