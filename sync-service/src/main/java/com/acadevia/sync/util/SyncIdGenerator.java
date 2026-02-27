package com.acadevia.sync.util;

import lombok.experimental.UtilityClass;

import java.util.UUID;

@UtilityClass
public class SyncIdGenerator {

    public static String generateBatchId() {
        return "BAT-" + UUID.randomUUID().toString();
    }

    public static String generateSyncQueueId() {
        return "SYN-" + UUID.randomUUID().toString();
    }

    public static String generateConflictId() {
        return "CON-" + UUID.randomUUID().toString();
    }

    public static String generateManifestId() {
        return "MAN-" + UUID.randomUUID().toString();
    }

    public static String generateChunkId() {
        return "CHK-" + UUID.randomUUID().toString();
    }

    public static String generateActivityId() {
        return "ACT-" + UUID.randomUUID().toString();
    }
}
