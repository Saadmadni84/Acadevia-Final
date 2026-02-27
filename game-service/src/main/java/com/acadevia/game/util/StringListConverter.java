package com.acadevia.game.util;

import jakarta.persistence.Converter;

import java.util.List;

@Converter
@SuppressWarnings("unchecked")
public class StringListConverter extends JsonConverter<List<String>> {
    public StringListConverter() {
        super((Class<List<String>>) (Class<?>) List.class);
    }
}
