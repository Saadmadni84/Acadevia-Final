package com.acadevia.sync.repository;

import com.acadevia.sync.entity.SyncBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SyncBatchRepository extends JpaRepository<SyncBatch, Long> {
    Optional<SyncBatch> findByBatchId(String batchId);
}
