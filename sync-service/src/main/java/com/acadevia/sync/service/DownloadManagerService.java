package com.acadevia.sync.service;

import com.acadevia.sync.dto.request.ChunkCompleteRequest;
import com.acadevia.sync.dto.request.DownloadRequest;
import com.acadevia.sync.dto.response.DownloadManifestResponse;
import com.acadevia.sync.entity.ContentCache;
import com.acadevia.sync.entity.DownloadChunk;
import com.acadevia.sync.entity.DownloadManifest;
import com.acadevia.sync.enums.DownloadQuality;
import com.acadevia.sync.enums.DownloadStatus;
import com.acadevia.sync.repository.DownloadChunkRepository;
import com.acadevia.sync.repository.DownloadManifestRepository;
import com.acadevia.sync.util.SyncIdGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class DownloadManagerService {

    private final DownloadManifestRepository manifestRepository;
    private final DownloadChunkRepository chunkRepository;
    private final ContentCacheService contentCacheService;

    private static final int CHUNK_SIZE = 1024 * 1024; // 1MB

    @Transactional
    public DownloadManifestResponse initiateDownload(Long userId, DownloadRequest request) {
        // Resolve quality
        DownloadQuality quality = request.getQuality();
        if (quality == null) {
            quality = DownloadQuality.Q_360P;
        }

        // Get Content Info & Size
        ContentCache content = contentCacheService.getContentInfo(request.getContentType(), request.getContentId());
        long fileSize = contentCacheService.getFileSizeForQuality(content, quality);
        int totalChunks = (int) Math.ceil((double) fileSize / CHUNK_SIZE);

        // Create Manifest
        DownloadManifest manifest = DownloadManifest.builder()
                .downloadId(SyncIdGenerator.generateManifestId())
                .userId(userId)
                .contentId(request.getContentId())
                .contentType(request.getContentType())
                .quality(quality)
                .totalSizeBytes(fileSize)
                .downloadedBytes(0L)
                .totalChunks(totalChunks)
                .downloadedChunks(0)
                .status(DownloadStatus.QUEUED)
                .requestedAt(LocalDateTime.now())
                .build();
        manifestRepository.save(manifest);

        // Generate Chunks
        List<DownloadChunk> chunks = new ArrayList<>();
        for (int i = 0; i < totalChunks; i++) {
            long start = (long) i * CHUNK_SIZE;
            long end = Math.min(start + CHUNK_SIZE - 1, fileSize - 1);

            chunks.add(DownloadChunk.builder()
                    .manifest(manifest)
                    .chunkIndex(i)
                    .startByte(start)
                    .endByte(end)
                    .sizeBytes(end - start + 1)
                    .status(DownloadStatus.QUEUED)
                    .checksum("SHA-" + i)
                    .build());
        }
        chunkRepository.saveAll(chunks);

        // Update status to DOWNLOADING
        manifest.setStatus(DownloadStatus.DOWNLOADING);
        manifest.setChunks(chunks);
        manifestRepository.save(manifest);

        return buildResponse(manifest, chunks);
    }

    @Transactional
    public void completeChunk(Long userId, Long manifestId, ChunkCompleteRequest request) {
        DownloadManifest manifest = manifestRepository.findById(manifestId)
                .orElseThrow(() -> new RuntimeException("Manifest not found"));

        // Find chunk by index within this manifest
        DownloadChunk chunk = manifest.getChunks().stream()
                .filter(c -> c.getChunkIndex().equals(request.getChunkIndex()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Chunk not found at index " + request.getChunkIndex()));

        if (Boolean.TRUE.equals(request.getIsSuccess())) {
            chunk.setStatus(DownloadStatus.COMPLETED);
        } else {
            chunk.setStatus(DownloadStatus.FAILED);
        }
        chunkRepository.save(chunk);

        // Update Manifest progress
        long completedCount = manifest.getChunks().stream()
                .filter(c -> c.getStatus() == DownloadStatus.COMPLETED)
                .count();
        manifest.setDownloadedChunks((int) completedCount);

        if (manifest.getDownloadedChunks() >= manifest.getTotalChunks()) {
            manifest.setStatus(DownloadStatus.COMPLETED);
            manifest.setCompletedAt(LocalDateTime.now());
        }
        manifest.setLastActivityAt(LocalDateTime.now());
        manifestRepository.save(manifest);
    }

    private DownloadManifestResponse buildResponse(DownloadManifest manifest, List<DownloadChunk> chunks) {
        List<DownloadManifestResponse.ChunkInfo> chunkInfos = chunks.stream()
                .map(c -> DownloadManifestResponse.ChunkInfo.builder()
                        .index(c.getChunkIndex())
                        .startByte(c.getStartByte())
                        .endByte(c.getEndByte())
                        .isDownloaded(c.getStatus() == DownloadStatus.COMPLETED)
                        .build())
                .collect(Collectors.toList());

        return DownloadManifestResponse.builder()
                .downloadId(manifest.getDownloadId())
                .contentTitle(manifest.getContentTitle())
                .totalSize(manifest.getTotalSizeBytes())
                .totalChunks(manifest.getTotalChunks())
                .status(manifest.getStatus())
                .chunks(chunkInfos)
                .build();
    }
}
