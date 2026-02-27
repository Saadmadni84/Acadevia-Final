package com.acadevia.content.entity.enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum VideoQuality {
    _144P("144p"),
    _240P("240p"),
    _360P("360p"),
    _480P("480p"),
    _720P("720p"),
    _1080P("1080p");

    private final String value;

    VideoQuality(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    public static VideoQuality fromValue(String value) {
        for (VideoQuality quality : values()) {
            if (quality.value.equalsIgnoreCase(value)) {
                return quality;
            }
        }
        throw new IllegalArgumentException("Unknown video quality: " + value);
    }
}
