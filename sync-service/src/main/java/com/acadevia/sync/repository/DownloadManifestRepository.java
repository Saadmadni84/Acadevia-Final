package com.acadevia.sync.repository;

import com.acadevia.sync.entity.DownloadManifest;
import com.acadevia.sync.enums.DownloadStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface DownloadManifestRepository extends JpaRepository<DownloadManifest, Long> {
    Optional<DownloadManifest> findByDownloadId(String downloadId);
    
    @Query("SELECT COUNT(d) FROM DownloadManifest d WHERE d.userId = :userId AND d.deviceId = :deviceId AND d.status = 'DOWNLOADING'")
    long countActiveDownloads(@Param("userId") Long userId, @Param("deviceId") String deviceId);
}
