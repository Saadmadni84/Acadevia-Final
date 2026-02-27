package com.acadevia.sync.strategy;

import com.acadevia.sync.entity.SyncConflict;
import org.springframework.stereotype.Component;

@Component
public class ManualResolutionStrategy implements ConflictStrategy {
    @Override
    public String resolve(SyncConflict conflict) {
        // Returns null to indicate that no automatic resolution is possible.
        // The system should flag this conflict for user intervention.
        return null; 
    }
}
