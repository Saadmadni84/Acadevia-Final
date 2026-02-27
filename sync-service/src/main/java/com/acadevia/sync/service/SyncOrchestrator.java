package com.acadevia.sync.service;

import com.acadevia.sync.dto.request.BatchSyncRequest;
import com.acadevia.sync.dto.request.SyncPushRequest;
import com.acadevia.sync.dto.request.SyncPullRequest;
import com.acadevia.sync.dto.response.SyncPushResponse;
import com.acadevia.sync.dto.response.SyncPullResponse;
import com.acadevia.sync.dto.response.SyncStatusResponse;
import com.acadevia.sync.enums.SyncStatus;
import com.acadevia.sync.kafka.producer.SyncEventProducer;
import com.acadevia.sync.repository.SyncBatchRepository;
import com.acadevia.sync.entity.SyncBatch;
import com.acadevia.sync.util.SyncIdGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@Slf4j
@RequiredArgsConstructor
public class SyncOrchestrator {

    private final DeviceRegistryService deviceRegistryService;
    private final SyncPushService pushService;
    private final SyncPullService pullService;
    private final SyncEventProducer eventProducer;
    private final SyncBatchRepository batchRepository;

    @Transactional
    public SyncStatusResponse performBatchSync(Long userId, BatchSyncRequest request) {
        String batchId = SyncIdGenerator.generateBatchId();

        SyncBatch batch = SyncBatch.builder()
                .batchId(batchId)
                .userId(userId)
                .totalItems(request.getChanges() != null ? request.getChanges().size() : 0)
                .processedItems(0)
                .failedItems(0)
                .status(SyncStatus.IN_PROGRESS)
                .startedAt(LocalDateTime.now())
                .build();
        batchRepository.save(batch);

        try {
            if (request.getChanges() != null && !request.getChanges().isEmpty()) {
                int processed = 0;
                int failed = 0;
                for (SyncPushRequest pushRequest : request.getChanges()) {
                    try {
                        pushService.processPush(userId, pushRequest);
                        processed++;
                    } catch (Exception e) {
                        log.error("Failed to process push item: {}", e.getMessage());
                        failed++;
                    }
                }
                batch.setProcessedItems(processed);
                batch.setFailedItems(failed);
            }

            batch.setStatus(SyncStatus.COMPLETED);
            batch.setCompletedAt(LocalDateTime.now());
            batchRepository.save(batch);

            eventProducer.publishSyncCompleted(userId, batch.getDeviceId(), batchId);

            return SyncStatusResponse.builder()
                    .lastSyncStatus("COMPLETED")
                    .lastSyncTime(LocalDateTime.now())
                    .pendingUploads(0)
                    .pendingDownloads(0)
                    .build();
        } catch (Exception e) {
            batch.setStatus(SyncStatus.FAILED);
            batch.setCompletedAt(LocalDateTime.now());
            batchRepository.save(batch);
            throw e;
        }
    }

    public SyncPushResponse pushSync(Long userId, SyncPushRequest request) {
        return pushService.processPush(userId, request);
    }

    public SyncPullResponse pullSync(Long userId, SyncPullRequest request) {
        return pullService.processPull(userId, request);
    }
}
