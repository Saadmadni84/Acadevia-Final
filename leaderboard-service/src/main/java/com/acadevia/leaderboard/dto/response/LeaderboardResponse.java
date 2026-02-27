package com.acadevia.leaderboard.dto.response;

import com.acadevia.leaderboard.enums.GeoScope;
import com.acadevia.leaderboard.enums.TimeScope;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardResponse {
    private TimeScope timeScope;
    private GeoScope geoScope;
    private String scopeValue; // "global", "IN", "class-123"
    private String subject;

    private List<LeaderboardEntryDto> entries;
    private LeaderboardEntryDto userEntry; // The requesting user's specific rank

    private long totalParticipants;
    private long nextUpdateInSeconds;
}
