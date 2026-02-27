package com.acadevia.content.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WatchProgressResponse {

    private Long id;
    private Long videoId;
    private Long userId;
    private Integer lastPositionSec;
    private Integer totalWatchedSec;
    private Double watchPercentage;
    private Boolean isCompleted;
    private Double lastPlaybackSpeed;
    private String lastQuality;
    private Integer rewatchCount;
    private List<RewatchSectionResponse> rewatchSections;
    private Integer sessionCount;
    private LocalDateTime firstWatchedAt;
    private LocalDateTime lastWatchedAt;
    private LocalDateTime completedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RewatchSectionResponse {
        private Integer start;
        private Integer end;
    }
}
