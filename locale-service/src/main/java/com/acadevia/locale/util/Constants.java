package com.acadevia.locale.util;

import lombok.experimental.UtilityClass;

@UtilityClass
public class Constants {
    public static final String DEFAULT_LANGUAGE = "en";
    public static final String FALLBACK_LANGUAGE = "hi";

    // Kafka Topics
    public static final String TOPIC_CONTENT_CREATED = "content.created";
    public static final String TOPIC_TRANSLATION_REQUESTED = "translation.requested";
    public static final String TOPIC_TRANSLATION_COMPLETED = "translation.completed";

    // Redis Keys
    public static final String CACHE_LANGUAGE_PACK = "locale:pack:";
    public static final String CACHE_TRANSLATION = "locale:translation:";
    public static final String CACHE_CONTENT_TRANSLATION = "locale:content:";
    public static final String CACHE_LANGUAGES = "locale:languages";
    public static final String CACHE_STATE_LANG_MAP = "locale:state:lang:";

    // Special Keys
    public static final String VARIABLE_PATTERN = "\\{([^}]+)\\}";
}
