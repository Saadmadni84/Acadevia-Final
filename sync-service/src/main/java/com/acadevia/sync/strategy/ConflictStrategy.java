package com.acadevia.sync.strategy;

import com.acadevia.sync.entity.SyncConflict;

public interface ConflictStrategy {
    String resolve(SyncConflict conflict);
}
