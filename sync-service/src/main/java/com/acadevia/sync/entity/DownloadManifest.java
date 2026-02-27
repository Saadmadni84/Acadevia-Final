package com.acadevia.sync.entity;

import com.acadevia.sync.enums.DownloadQuality;
import com.acadevia.sync.enums.DownloadStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "download_manifest")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DownloadManifest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String downloadId; // UUID

    private Long userId;
    private String deviceId;

    private String contentId; // e.g., "COURSE_123"
    private String contentTitle;
    private String contentType; // VIDEO, PDF, GAME_ASSETS

    @Enumerated(EnumType.STRING)
    private DownloadQuality quality;

    private Long totalSizeBytes;
    private Long downloadedBytes;
    private Integer totalChunks;
    private Integer downloadedChunks;

    @Enumerated(EnumType.STRING)
    private DownloadStatus status;

    private String localFilePath;
    private String s3Key;

    private LocalDateTime requestedAt;
    private LocalDateTime completedAt;
    private LocalDateTime lastActivityAt; // For pausing/resuming logic
    
    @OneToMany(mappedBy = "manifest", cascade = CascadeType.ALL)
    private List<DownloadChunk> chunks;
}
