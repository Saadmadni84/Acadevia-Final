package com.acadevia.sync.dto.response;

import com.acadevia.sync.enums.SyncEntityType;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class SyncPullResponse {
    private SyncEntityType entityType;
    private List<EntityChange> changes;
    private Long newSequenceNumber;
    private Boolean hasMore;

    @Data
    @Builder
    public static class EntityChange {
        private String entityId;
        private String operation; // CREATE, UPDATE, DELETE
        private String payloadJson;
        private Integer version;
    }
}
