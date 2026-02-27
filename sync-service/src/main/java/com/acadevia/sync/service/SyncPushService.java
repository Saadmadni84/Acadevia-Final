package com.acadevia.sync.service;

import com.acadevia.sync.dto.request.SyncItem;
import com.acadevia.sync.dto.request.SyncPushRequest;
import com.acadevia.sync.dto.response.SyncPushResponse;
import com.acadevia.sync.entity.SyncConflict;
import com.acadevia.sync.entity.SyncQueue;
import com.acadevia.sync.enums.SyncStatus;
import com.acadevia.sync.repository.SyncQueueRepository;
import com.acadevia.sync.strategy.ConflictStrategy;
import com.acadevia.sync.util.SyncIdGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SyncPushService {

    private final SyncQueueRepository syncQueueRepository;
    private final ConflictResolutionService conflictResolutionService;
    private final CheckpointService checkpointService;

    @Transactional
    public SyncPushResponse processPush(Long userId, SyncPushRequest request) {
        String batchId = SyncIdGenerator.generateBatchId();
        List<SyncPushResponse.SyncItemResult> results = new ArrayList<>();
        int conflicts = 0;
        int failed = 0;
        int processed = 0;

        for (SyncItem item : request.getItems()) {
            try {
                // 1. Check version
                int serverVersion = checkpointService.getServerVersion(userId, item.getEntityType());

                if (serverVersion > item.getClientVersion()) {
                    // CONFLICT
                    conflicts++;
                    String serverPayload = "{}"; // Fetch real current state
                    SyncConflict conflict = conflictResolutionService.createConflict(
                            userId, item.getEntityType(), serverPayload, item.getPayloadJson());
                    ConflictStrategy strategy = conflictResolutionService.determineAutoStrategy(item.getEntityType());

                    String resolved = strategy.resolve(conflict);

                    if (resolved != null) {
                        // Auto-resolved
                        item.setPayloadJson(resolved);
                        saveToQueue(userId, request.getDeviceId(), item, SyncStatus.COMPLETED);
                        results.add(new SyncPushResponse.SyncItemResult(item.getEntityId(), "SUCCESS", "Auto-resolved"));
                    } else {
                        // Manual required
                        results.add(new SyncPushResponse.SyncItemResult(item.getEntityId(), "CONFLICT",
                                "Manual resolution required"));
                    }
                } else {
                    // NO CONFLICT - SAVE
                    saveToQueue(userId, request.getDeviceId(), item, SyncStatus.COMPLETED);
                    checkpointService.updateCheckpoint(userId, request.getDeviceId(),
                            item.getEntityType(), item.getClientVersion());
                    processed++;
                    results.add(new SyncPushResponse.SyncItemResult(item.getEntityId(), "SUCCESS", null));
                }
            } catch (Exception e) {
                failed++;
                log.error("Sync failed for item {}", item.getEntityId(), e);
                results.add(new SyncPushResponse.SyncItemResult(item.getEntityId(), "FAILED", e.getMessage()));
            }
        }

        return SyncPushResponse.builder()
                .batchId(batchId)
                .totalReceived(request.getItems().size())
                .totalProcessed(processed)
                .totalConflicts(conflicts)
                .totalFailed(failed)
                .results(results)
                .build();
    }

    private void saveToQueue(Long userId, String deviceId, SyncItem item, SyncStatus status) {
        SyncQueue queue = new SyncQueue();
        queue.setUserId(userId);
        queue.setDeviceId(deviceId);
        queue.setEntityType(item.getEntityType());
        queue.setEntityId(item.getEntityId());
        queue.setStatus(status);
        queue.setPayloadJson(item.getPayloadJson());
        queue.setVersion(item.getClientVersion());
        syncQueueRepository.save(queue);
    }
}
