package com.acadevia.sync.repository;

import com.acadevia.sync.entity.SyncQueue;
import com.acadevia.sync.enums.SyncStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SyncQueueRepository extends JpaRepository<SyncQueue, Long> {

    List<SyncQueue> findByUserIdAndStatus(Long userId, SyncStatus status);

    List<SyncQueue> findByDeviceIdAndStatus(String deviceId, SyncStatus status);
}
