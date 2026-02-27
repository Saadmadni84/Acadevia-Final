package com.acadevia.game.service;

import com.acadevia.game.dto.game.LeaderboardEntry;

import java.time.LocalDateTime;
import java.util.List;

public interface LeaderboardService {

    List<LeaderboardEntry> getGlobalLeaderboard(int limit);

    List<LeaderboardEntry> getFriendsLeaderboard(Long userId, int limit);

    List<LeaderboardEntry> getGameLeaderboard(Long gameId, LocalDateTime startDate, int limit);

    void updateLeaderboardAsync(Long userId, Long gameId, int score);

}
