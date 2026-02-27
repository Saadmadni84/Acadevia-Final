package com.acadevia.content.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserVideoProgressResponse {

    private Long videoId;
    private String videoTitle;
    private Integer durationSeconds;
    private WatchProgressResponse watchProgress;
    private PopQuestionProgressSummary popQuestionProgress;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PopQuestionProgressSummary {
        private Integer totalQuestions;
        private Integer answeredQuestions;
        private Integer correctAnswers;
        private Double accuracyRate;
        private Integer totalXpEarned;
    }
}
