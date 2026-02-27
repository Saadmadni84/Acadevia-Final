package com.acadevia.sync.enums;

public enum ConflictResolutionStrategy {
    LAST_WRITE_WINS,
    SERVER_WINS,
    CLIENT_WINS,
    MANUAL_MERGE,
    CUSTOM_FUNCTION
}
