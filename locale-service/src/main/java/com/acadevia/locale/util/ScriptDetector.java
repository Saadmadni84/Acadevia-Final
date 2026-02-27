package com.acadevia.locale.util;

import com.acadevia.locale.enums.TextDirection;
import lombok.experimental.UtilityClass;

import java.util.Map;

@UtilityClass
public class ScriptDetector {

    private static final Map<String, String> LANGUAGE_SCRIPT_MAP = Map.ofEntries(
            Map.entry("en", "Latin"),
            Map.entry("hi", "Devanagari"),
            Map.entry("ta", "Tamil"),
            Map.entry("te", "Telugu"),
            Map.entry("bn", "Bengali"),
            Map.entry("mr", "Devanagari"),
            Map.entry("gu", "Gujarati"),
            Map.entry("kn", "Kannada"),
            Map.entry("ml", "Malayalam"),
            Map.entry("pa", "Gurmukhi"),
            Map.entry("or", "Odia"),
            Map.entry("as", "Bengali"),
            Map.entry("ur", "Nastaliq"),
            Map.entry("mai", "Devanagari"),
            Map.entry("sa", "Devanagari"),
            Map.entry("ne", "Devanagari"),
            Map.entry("ks", "Nastaliq"),
            Map.entry("mni", "Meetei_Mayek"),
            Map.entry("sat", "Ol_Chiki"),
            Map.entry("bho", "Devanagari"),
            Map.entry("raj", "Devanagari"),
            Map.entry("chh", "Devanagari"),
            Map.entry("har", "Devanagari"),
            Map.entry("mag", "Devanagari"),
            Map.entry("mar", "Devanagari")
    );

    private static final Map<String, TextDirection> SCRIPT_DIRECTION_MAP = Map.of(
            "Nastaliq", TextDirection.RTL
    );

    public static String getScript(String languageCode) {
        return LANGUAGE_SCRIPT_MAP.getOrDefault(languageCode, "Latin");
    }

    public static TextDirection getDirection(String languageCode) {
        String script = getScript(languageCode);
        return SCRIPT_DIRECTION_MAP.getOrDefault(script, TextDirection.LTR);
    }

    public static boolean isRTL(String languageCode) {
        return getDirection(languageCode) == TextDirection.RTL;
    }

    public static String getFontFamily(String languageCode) {
        String script = getScript(languageCode);
        return switch (script) {
            case "Devanagari" -> "Noto Sans Devanagari, sans-serif";
            case "Tamil" -> "Noto Sans Tamil, sans-serif";
            case "Telugu" -> "Noto Sans Telugu, sans-serif";
            case "Bengali" -> "Noto Sans Bengali, sans-serif";
            case "Gujarati" -> "Noto Sans Gujarati, sans-serif";
            case "Kannada" -> "Noto Sans Kannada, sans-serif";
            case "Malayalam" -> "Noto Sans Malayalam, sans-serif";
            case "Gurmukhi" -> "Noto Sans Gurmukhi, sans-serif";
            case "Odia" -> "Noto Sans Oriya, sans-serif";
            case "Nastaliq" -> "Noto Nastaliq Urdu, serif";
            case "Meetei_Mayek" -> "Noto Sans Meetei Mayek, sans-serif";
            case "Ol_Chiki" -> "Noto Sans Ol Chiki, sans-serif";
            default -> "Inter, sans-serif";
        };
    }
}
