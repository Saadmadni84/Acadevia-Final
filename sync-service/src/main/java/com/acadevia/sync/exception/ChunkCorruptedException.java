package com.acadevia.sync.exception;

public class ChunkCorruptedException extends RuntimeException {
    public ChunkCorruptedException(String message) {
        super(message);
    }
}
