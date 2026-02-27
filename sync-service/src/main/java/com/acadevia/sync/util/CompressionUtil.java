package com.acadevia.sync.util;

import lombok.experimental.UtilityClass;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.zip.GZIPInputStream;
import java.util.zip.GZIPOutputStream;

@UtilityClass
public class CompressionUtil {

    private static final int COMPRESSION_THRESHOLD = 1024; // 1KB

    public static boolean shouldCompress(String data) {
        return data != null && data.getBytes(StandardCharsets.UTF_8).length > COMPRESSION_THRESHOLD;
    }

    public static String compress(String data) {
        if (data == null) return null;
        try {
            ByteArrayOutputStream bos = new ByteArrayOutputStream();
            try (GZIPOutputStream gzip = new GZIPOutputStream(bos)) {
                gzip.write(data.getBytes(StandardCharsets.UTF_8));
            }
            return Base64.getEncoder().encodeToString(bos.toByteArray());
        } catch (Exception e) {
            throw new RuntimeException("Compression failed", e);
        }
    }

    public static String decompress(String compressedData) {
        if (compressedData == null) return null;
        try {
            byte[] bytes = Base64.getDecoder().decode(compressedData);
            try (GZIPInputStream gis = new GZIPInputStream(new ByteArrayInputStream(bytes))) {
                return new String(gis.readAllBytes(), StandardCharsets.UTF_8);
            }
        } catch (Exception e) {
            throw new RuntimeException("Decompression failed", e);
        }
    }
}
