package com.acadevia.content.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.GONE)
public class DownloadExpiredException extends RuntimeException {

    public DownloadExpiredException(String message) {
        super(message);
    }
}
