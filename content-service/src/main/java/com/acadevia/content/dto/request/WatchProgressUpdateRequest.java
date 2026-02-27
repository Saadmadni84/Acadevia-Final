package com.acadevia.content.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WatchProgressUpdateRequest {

    @NotNull(message = "Video ID is required")
    private Long videoId;

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Last position is required")
    @Min(value = 0, message = "Position must be non-negative")
    private Integer lastPositionSec;

    @NotNull(message = "Total watched time is required")
    @Min(value = 0, message = "Total watched time must be non-negative")
    private Integer totalWatchedSec;

    @Min(value = 0)
    @Max(value = 100)
    private Double watchPercentage;

    private Boolean isCompleted;

    private Double lastPlaybackSpeed;

    private String lastQuality;

    private List<RewatchSectionRequest> rewatchSections;

    private Integer rewatchCount;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RewatchSectionRequest {
        @NotNull
        private Integer start;

        @NotNull
        private Integer end;
    }
}
