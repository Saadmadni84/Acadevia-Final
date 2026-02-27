package com.acadevia.sync.exception;

public class DownloadQuotaExceededException extends RuntimeException {
    public DownloadQuotaExceededException(String message) {
        super(message);
    }
}
