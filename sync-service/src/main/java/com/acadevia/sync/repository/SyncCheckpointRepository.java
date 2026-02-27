package com.acadevia.sync.repository;

import com.acadevia.sync.entity.SyncCheckpoint;
import com.acadevia.sync.enums.SyncEntityType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface SyncCheckpointRepository extends JpaRepository<SyncCheckpoint, Long> {
    
    Optional<SyncCheckpoint> findByUserIdAndDeviceIdAndEntityType(Long userId, String deviceId, SyncEntityType entityType);

    @Query("SELECT MAX(s.lastSequenceNumber) FROM SyncCheckpoint s WHERE s.userId = :userId AND s.entityType = :entityType")
    Long getLatestServerVersion(@Param("userId") Long userId, @Param("entityType") SyncEntityType entityType);
}
