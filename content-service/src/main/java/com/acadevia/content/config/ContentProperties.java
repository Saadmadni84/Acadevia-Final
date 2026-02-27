package com.acadevia.content.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "acadevia.content")
public class ContentProperties {

    private VideoProperties video = new VideoProperties();
    private DownloadProperties download = new DownloadProperties();
    private PopQuestionProperties popQuestion = new PopQuestionProperties();

    @Data
    public static class VideoProperties {
        private int maxTitleLength = 255;
        private String defaultLanguage = "en";
        private String defaultQuality = "360p";
        private double completionThreshold = 90.0;
    }

    @Data
    public static class DownloadProperties {
        private int maxPerUser = 50;
        private int maxPerDevice = 10;
        private int tokenExpiryHours = 24;
        private int downloadExpiryDays = 30;
        private int maxRetries = 3;
    }

    @Data
    public static class PopQuestionProperties {
        private int defaultTimeLimit = 30;
        private int defaultXpReward = 5;
        private int bonusXpFirstCorrect = 10;
    }
}
