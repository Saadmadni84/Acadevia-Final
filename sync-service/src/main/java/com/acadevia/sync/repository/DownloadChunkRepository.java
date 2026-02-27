package com.acadevia.sync.repository;

import com.acadevia.sync.entity.DownloadChunk;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DownloadChunkRepository extends JpaRepository<DownloadChunk, Long> {
    Optional<DownloadChunk> findByManifestIdAndChunkIndex(Long manifestId, Integer chunkIndex);
}
