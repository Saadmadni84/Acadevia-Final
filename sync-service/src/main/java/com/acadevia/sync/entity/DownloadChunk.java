package com.acadevia.sync.entity;

import com.acadevia.sync.enums.DownloadStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "download_chunk")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DownloadChunk {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manifest_id")
    private DownloadManifest manifest;

    private Integer chunkIndex;
    private Long startByte;
    private Long endByte;
    private Long sizeBytes;

    @Enumerated(EnumType.STRING)
    private DownloadStatus status;

    private String checksum; // To verify integrity
    
    // If we support peer-to-peer or multi-source, we could track sourceUrl here
}
