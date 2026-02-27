package com.acadevia.sync.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ChunkDownloadResponse {
    private String downloadId;
    private Integer chunkIndex;
    private byte[] data; // or a presigned URL
    private String checksum;
}
