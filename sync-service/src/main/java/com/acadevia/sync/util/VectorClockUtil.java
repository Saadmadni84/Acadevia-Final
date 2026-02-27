package com.acadevia.sync.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.experimental.UtilityClass;

import java.util.HashMap;
import java.util.Map;

@UtilityClass
public class VectorClockUtil {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Increment the vector clock for a specific device.
     */
    public static String increment(String clockJson, String deviceId) {
        Map<String, Long> clock = parseClock(clockJson);
        clock.put(deviceId, clock.getOrDefault(deviceId, 0L) + 1);
        return performSerializtion(clock);
    }

    /**
     * Check if two vector clocks are concurrent (conflict).
     * Returns true if neither clock effectively descends from the other.
     */
    public static boolean isConcurrent(String clockJson1, String clockJson2) {
        Map<String, Long> c1 = parseClock(clockJson1);
        Map<String, Long> c2 = parseClock(clockJson2);

        boolean c1HasGreater = false;
        boolean c2HasGreater = false;

        // Iterate over union of keys
        java.util.Set<String> allKeys = new java.util.HashSet<>(c1.keySet());
        allKeys.addAll(c2.keySet());

        for (String key : allKeys) {
            long v1 = c1.getOrDefault(key, 0L);
            long v2 = c2.getOrDefault(key, 0L);

            if (v1 > v2) c1HasGreater = true;
            if (v2 > v1) c2HasGreater = true;
        }

        // It's a conflict (concurrent) if both have some values greater than the other
        return c1HasGreater && c2HasGreater;
    }

    private static Map<String, Long> parseClock(String json) {
        if (json == null || json.isEmpty()) return new HashMap<>();
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, Long>>() {});
        } catch (JsonProcessingException e) {
            return new HashMap<>();
        }
    }

    private static String performSerializtion(Map<String, Long> clock) {
        try {
            return objectMapper.writeValueAsString(clock);
        } catch (JsonProcessingException e) {
            return "{}";
        }
    }
}
