package com.acadevia.content.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
public class UnsupportedContentException extends RuntimeException {

    public UnsupportedContentException(String message) {
        super(message);
    }
}
