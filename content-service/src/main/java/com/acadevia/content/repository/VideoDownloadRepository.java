package com.acadevia.content.repository;

import com.acadevia.content.entity.VideoDownload;
import com.acadevia.content.entity.enums.DownloadStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VideoDownloadRepository extends JpaRepository<VideoDownload, Long> {

    Page<VideoDownload> findByUserId(Long userId, Pageable pageable);

    List<VideoDownload> findByUserIdAndDownloadStatus(Long userId, DownloadStatus status);

    Optional<VideoDownload> findByDownloadToken(String downloadToken);

    @Query("SELECT d FROM VideoDownload d WHERE d.userId = :userId AND d.videoId = :videoId AND d.downloadStatus IN ('QUEUED', 'DOWNLOADING', 'COMPLETED')")
    List<VideoDownload> findActiveDownloadsByUserAndVideo(@Param("userId") Long userId, @Param("videoId") Long videoId);

    @Query("SELECT d FROM VideoDownload d WHERE d.downloadStatus = 'QUEUED' OR d.downloadStatus = 'DOWNLOADING' ORDER BY d.requestedAt")
    List<VideoDownload> findPendingDownloads();

    @Query("SELECT d FROM VideoDownload d WHERE d.tokenExpiresAt < :now AND d.downloadStatus != 'COMPLETED' AND d.downloadStatus != 'FAILED' AND d.downloadStatus != 'CANCELLED'")
    List<VideoDownload> findExpiredTokens(@Param("now") LocalDateTime now);

    @Query("SELECT d FROM VideoDownload d WHERE d.expiresAt < :now AND d.downloadStatus = 'COMPLETED' AND d.deletedAt IS NULL")
    List<VideoDownload> findExpiredDownloads(@Param("now") LocalDateTime now);

    @Query("SELECT COUNT(d) FROM VideoDownload d WHERE d.userId = :userId AND d.downloadStatus = 'COMPLETED' AND d.deletedAt IS NULL")
    Long countActiveDownloadsByUser(@Param("userId") Long userId);

    @Modifying
    @Query("UPDATE VideoDownload d SET d.downloadStatus = :status WHERE d.id = :downloadId")
    void updateStatus(@Param("downloadId") Long downloadId, @Param("status") DownloadStatus status);

    @Modifying
    @Query("UPDATE VideoDownload d SET d.downloadProgressPct = :progress WHERE d.id = :downloadId")
    void updateProgress(@Param("downloadId") Long downloadId, @Param("progress") Double progress);

    @Query("SELECT COUNT(d) FROM VideoDownload d WHERE d.userId = :userId AND d.deviceId = :deviceId AND d.downloadStatus = 'COMPLETED' AND d.deletedAt IS NULL")
    Long countActiveDownloadsByUserAndDevice(@Param("userId") Long userId, @Param("deviceId") String deviceId);
}
