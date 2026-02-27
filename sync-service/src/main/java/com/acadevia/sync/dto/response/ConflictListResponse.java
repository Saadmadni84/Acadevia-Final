package com.acadevia.sync.dto.response;

import com.acadevia.sync.enums.SyncEntityType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ConflictListResponse {
    private List<ConflictDetail> conflicts;

    @Data
    @Builder
    public static class ConflictDetail {
        private Long id;
        private SyncEntityType entityType;
        private String entityId;
        private String serverPayload;
        private String clientPayload;
        private LocalDateTime detectedAt;
    }
}
