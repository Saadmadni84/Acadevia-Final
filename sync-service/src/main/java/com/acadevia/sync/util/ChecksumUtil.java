package com.acadevia.sync.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.experimental.UtilityClass;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@UtilityClass
public class ChecksumUtil {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static String calculateChecksum(byte[] data) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data);
            return bytesToHex(hash);
        } catch (Exception e) {
            throw new RuntimeException("Error calculating checksum", e);
        }
    }

    public static String calculateChecksum(String data) {
        return calculateChecksum(data.getBytes(StandardCharsets.UTF_8));
    }

    public static boolean verifyChecksum(byte[] data, String expectedChecksum) {
        String calculated = calculateChecksum(data);
        return calculated.equalsIgnoreCase(expectedChecksum);
    }

    public static String calculateJsonChecksum(JsonNode json) {
        // Normalize JSON before hashing? For now, we assume raw string consistency or use canonical form if needed.
        return calculateChecksum(json.toString());
    }

    private static String bytesToHex(byte[] hash) {
        StringBuilder hexString = new StringBuilder(2 * hash.length);
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString();
    }
}
