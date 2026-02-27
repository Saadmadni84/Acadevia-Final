package com.acadevia.sync.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.Arrays;
import java.util.Comparator;

@Getter
@RequiredArgsConstructor
public enum DownloadQuality {
    Q_144P("144p", 100),   // ~100 Kbps
    Q_240P("240p", 250),   // ~250 Kbps
    Q_360P("360p", 500),   // ~500 Kbps - Standard for mobile
    Q_480P("480p", 1000),  // ~1 Mbps
    Q_720P("720p", 2500),  // ~2.5 Mbps
    Q_1080P("1080p", 5000); // ~5 Mbps

    private final String label;
    private final int minBandwidthKbps;

    public static DownloadQuality recommendForBandwidth(double availableKbps) {
        // Find highest quality where minBandwidth <= available
        return Arrays.stream(values())
                .filter(q -> q.minBandwidthKbps <= availableKbps)
                .max(Comparator.comparingInt(DownloadQuality::getMinBandwidthKbps))
                .orElse(Q_144P); // Fallback to lowest
    }
}
