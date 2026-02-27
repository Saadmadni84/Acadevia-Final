package com.acadevia.content.util;

import com.acadevia.content.entity.Video;
import com.acadevia.content.entity.enums.VideoQuality;
import com.acadevia.content.dto.response.VideoResponse;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public final class VideoUtils {

    private VideoUtils() {
    }

    public static String generateDownloadToken() {
        return UUID.randomUUID().toString().replace("-", "");
    }

    public static String formatDuration(int totalSeconds) {
        int hours = totalSeconds / 3600;
        int minutes = (totalSeconds % 3600) / 60;
        int seconds = totalSeconds % 60;

        if (hours > 0) {
            return String.format("%d:%02d:%02d", hours, minutes, seconds);
        }
        return String.format("%d:%02d", minutes, seconds);
    }

    public static double calculateWatchPercentage(int watchedSeconds, int totalSeconds) {
        if (totalSeconds <= 0) return 0.0;
        double percentage = (watchedSeconds * 100.0) / totalSeconds;
        return Math.min(percentage, 100.0);
    }

    public static boolean isVideoCompleted(double watchPercentage) {
        return watchPercentage >= AppConstants.COMPLETION_THRESHOLD_PERCENTAGE;
    }

    public static List<VideoResponse.VideoQualityInfo> getAvailableQualities(Video video) {
        List<VideoResponse.VideoQualityInfo> qualities = new ArrayList<>();

        addQualityIfAvailable(qualities, "144p", video.getUrl144p(), video.getSize144pMb());
        addQualityIfAvailable(qualities, "240p", video.getUrl240p(), video.getSize240pMb());
        addQualityIfAvailable(qualities, "360p", video.getUrl360p(), video.getSize360pMb());
        addQualityIfAvailable(qualities, "480p", video.getUrl480p(), video.getSize480pMb());
        addQualityIfAvailable(qualities, "720p", video.getUrl720p(), video.getSize720pMb());
        addQualityIfAvailable(qualities, "1080p", video.getUrl1080p(), video.getSize1080pMb());

        return qualities;
    }

    private static void addQualityIfAvailable(List<VideoResponse.VideoQualityInfo> qualities, String label, String url, BigDecimal size) {
        if (url != null && !url.isEmpty()) {
            qualities.add(VideoResponse.VideoQualityInfo.builder()
                    .quality(label)
                    .url(url)
                    .sizeMb(size)
                    .build());
        }
    }

    public static String getUrlForQuality(Video video, VideoQuality quality) {
        return switch (quality) {
            case _144P -> video.getUrl144p();
            case _240P -> video.getUrl240p();
            case _360P -> video.getUrl360p();
            case _480P -> video.getUrl480p();
            case _720P -> video.getUrl720p();
            case _1080P -> video.getUrl1080p();
        };
    }

    public static BigDecimal getSizeForQuality(Video video, VideoQuality quality) {
        return switch (quality) {
            case _144P -> video.getSize144pMb();
            case _240P -> video.getSize240pMb();
            case _360P -> video.getSize360pMb();
            case _480P -> video.getSize480pMb();
            case _720P -> video.getSize720pMb();
            case _1080P -> video.getSize1080pMb();
        };
    }

    public static VideoQuality parseQuality(String quality) {
        if (quality == null || quality.isEmpty()) {
            return VideoQuality._360P;
        }
        try {
            String normalized = quality.toUpperCase().replace("P", "");
            return VideoQuality.valueOf("_" + normalized + "P");
        } catch (IllegalArgumentException e) {
            return VideoQuality._360P;
        }
    }
}
