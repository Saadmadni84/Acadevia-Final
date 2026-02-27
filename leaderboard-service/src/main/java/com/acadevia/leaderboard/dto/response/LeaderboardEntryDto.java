package com.acadevia.leaderboard.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardEntryDto {
    private long rank;
    private String userId;
    private String username;
    private String avatarUrl;
    private double score; // Using double for ZSet compatibility, usually cast to long for XP
    private long trend;   // +2, -1 (rank change)
}
