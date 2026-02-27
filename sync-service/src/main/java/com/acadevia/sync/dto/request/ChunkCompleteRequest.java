package com.acadevia.sync.dto.request;

import lombok.Data;

@Data
public class ChunkCompleteRequest {
    private Integer chunkIndex;
    private String checksum;
    private Boolean isSuccess;
}
