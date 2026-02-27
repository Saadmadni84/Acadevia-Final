package com.acadevia.sync.service;

import com.acadevia.sync.dto.request.SyncPullRequest;
import com.acadevia.sync.dto.response.SyncPullResponse;
import com.acadevia.sync.entity.SyncQueue;
import com.acadevia.sync.enums.SyncEntityType;
import com.acadevia.sync.enums.SyncStatus;
import com.acadevia.sync.repository.SyncQueueRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SyncPullService {

    private final SyncQueueRepository syncQueueRepository;

    @Transactional(readOnly = true)
    public SyncPullResponse processPull(Long userId, SyncPullRequest request) {
        List<SyncPullResponse.EntityChange> changes = new ArrayList<>();

        for (SyncEntityType type : request.getEntityTypes()) {
            List<SyncQueue> completedItems = syncQueueRepository.findByUserIdAndStatus(userId, SyncStatus.COMPLETED);

            for (SyncQueue item : completedItems) {
                if (item.getEntityType() == type) {
                    changes.add(SyncPullResponse.EntityChange.builder()
                            .entityId(item.getEntityId())
                            .operation("UPDATE")
                            .payloadJson(item.getPayloadJson())
                            .version(item.getVersion())
                            .build());
                }
            }
        }

        Long newSequence = changes.isEmpty() ? 0L :
                changes.stream().mapToLong(c -> c.getVersion() != null ? c.getVersion().longValue() : 0L).max().orElse(0L);

        return SyncPullResponse.builder()
                .entityType(request.getEntityTypes().isEmpty() ? null : request.getEntityTypes().get(0))
                .changes(changes)
                .newSequenceNumber(newSequence)
                .hasMore(false)
                .build();
    }
}
