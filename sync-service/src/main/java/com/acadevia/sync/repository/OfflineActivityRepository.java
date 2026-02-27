package com.acadevia.sync.repository;

import com.acadevia.sync.entity.OfflineActivity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OfflineActivityRepository extends JpaRepository<OfflineActivity, Long> {
    boolean existsByReferenceId(String referenceId);
}
