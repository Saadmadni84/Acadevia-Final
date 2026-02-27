package com.acadevia.sync.dto.request;

import com.acadevia.sync.enums.SyncEntityType;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SyncItem {
    private SyncEntityType entityType;
    private String entityId;
    private String payloadJson;
    private Integer clientVersion;
    private LocalDateTime clientTimestamp;
    private String vectorClock;
    private boolean compressed;
}
