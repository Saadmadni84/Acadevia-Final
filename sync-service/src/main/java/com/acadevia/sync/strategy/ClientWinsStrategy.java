package com.acadevia.sync.strategy;

import com.acadevia.sync.entity.SyncConflict;
import org.springframework.stereotype.Component;

@Component
public class ClientWinsStrategy implements ConflictStrategy {
    @Override
    public String resolve(SyncConflict conflict) {
        return conflict.getClientPayload();
    }
}
