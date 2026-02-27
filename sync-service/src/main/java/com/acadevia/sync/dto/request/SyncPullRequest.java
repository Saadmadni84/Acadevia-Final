package com.acadevia.sync.dto.request;

import com.acadevia.sync.enums.SyncEntityType;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SyncPullRequest {
    private String deviceId;
    private List<SyncEntityType> entityTypes;
    private Long lastSyncTimestamp;
    private Integer lastSyncVersion; // Or map of entityType -> version
    private int pageSize;
    private String cursor;
    private boolean deltaOnly;
}
