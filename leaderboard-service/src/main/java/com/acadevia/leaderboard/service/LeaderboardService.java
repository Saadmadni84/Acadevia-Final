package com.acadevia.leaderboard.service;

import com.acadevia.leaderboard.dto.response.LeaderboardResponse;
import com.acadevia.leaderboard.enums.GeoScope;
import com.acadevia.leaderboard.enums.SubjectScope;
import com.acadevia.leaderboard.enums.TimeScope;

public interface LeaderboardService {

    LeaderboardResponse getLeaderboard(
            TimeScope timeScope,
            GeoScope geoScope,
            String scopeValue,
            SubjectScope subject,
            int page,
            int size,
            String requestingUserId
    );

    LeaderboardResponse getGlobalLeaderboard(int page, int size);
}
