package com.acadevia.content.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.TOO_MANY_REQUESTS)
public class DownloadLimitExceededException extends RuntimeException {

    public DownloadLimitExceededException(String message) {
        super(message);
    }
}
