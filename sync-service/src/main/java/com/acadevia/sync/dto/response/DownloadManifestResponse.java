package com.acadevia.sync.dto.response;

import com.acadevia.sync.enums.DownloadStatus;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class DownloadManifestResponse {
    private String downloadId;
    private String contentTitle;
    private Long totalSize;
    private Integer totalChunks;
    private DownloadStatus status;
    private List<ChunkInfo> chunks;

    @Data
    @Builder
    public static class ChunkInfo {
        private Integer index;
        private Long startByte;
        private Long endByte;
        private Boolean isDownloaded;
    }
}
