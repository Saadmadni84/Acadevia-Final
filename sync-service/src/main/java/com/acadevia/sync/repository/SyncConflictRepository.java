package com.acadevia.sync.repository;

import com.acadevia.sync.entity.SyncConflict;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SyncConflictRepository extends JpaRepository<SyncConflict, Long> {
    Optional<SyncConflict> findByConflictId(String conflictId);
}
