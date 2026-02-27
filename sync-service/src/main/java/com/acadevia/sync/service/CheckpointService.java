package com.acadevia.sync.service;

import com.acadevia.sync.entity.SyncCheckpoint;
import com.acadevia.sync.enums.SyncEntityType;
import com.acadevia.sync.repository.SyncCheckpointRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class CheckpointService {

    private final SyncCheckpointRepository repository;

    @Transactional(readOnly = true)
    public int getServerVersion(Long userId, SyncEntityType entityType) {
        Long v = repository.getLatestServerVersion(userId, entityType);
        return v != null ? v.intValue() : 0;
    }

    @Transactional
    public void updateCheckpoint(Long userId, String deviceId, SyncEntityType entityType, Integer version) {
        SyncCheckpoint cp = repository.findByUserIdAndDeviceIdAndEntityType(userId, deviceId, entityType)
                .orElseGet(() -> SyncCheckpoint.builder()
                        .userId(userId)
                        .deviceId(deviceId)
                        .entityType(entityType)
                        .lastSequenceNumber(0L)
                        .build());

        if (version > cp.getLastSequenceNumber()) {
            cp.setLastSequenceNumber(version.longValue());
            cp.setLastSyncTime(LocalDateTime.now());
            repository.save(cp);
        }
    }
}
