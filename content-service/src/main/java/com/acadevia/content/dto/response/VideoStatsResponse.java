package com.acadevia.content.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VideoStatsResponse {

    private Long videoId;
    private Integer totalViews;
    private Integer uniqueViewers;
    private Double avgWatchPct;
    private Long totalWatchTimeSec;
    private Integer totalPopQuestions;
    private Double avgPopAccuracy;
    private Integer totalDownloads;
    private Integer totalBookmarks;
    private Integer totalNotes;
    private Integer likeCount;
    private Integer dislikeCount;
    private Double completionRate;

    private PopQuestionStats popQuestionStats;
    private EngagementStats engagementStats;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PopQuestionStats {
        private Integer totalQuestions;
        private Double avgAccuracy;
        private Double avgTimeTaken;
        private Integer totalResponses;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EngagementStats {
        private Integer totalBookmarks;
        private Integer totalNotes;
        private Integer totalDownloads;
        private Double avgSessionDuration;
        private List<EngagementPoint> engagementTimeline;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EngagementPoint {
        private Integer timestampSec;
        private Integer viewCount;
        private Integer bookmarkCount;
        private Integer noteCount;
    }
}
