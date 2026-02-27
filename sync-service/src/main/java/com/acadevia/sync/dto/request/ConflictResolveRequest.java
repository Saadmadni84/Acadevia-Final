package com.acadevia.sync.dto.request;

import com.acadevia.sync.enums.ConflictResolutionStrategy;
import lombok.Data;

@Data
public class ConflictResolveRequest {
    private Long conflictId;
    private ConflictResolutionStrategy resolutionStrategy;
    private String manualPayloadJson; // Only if MANUAL_MERGE
}
