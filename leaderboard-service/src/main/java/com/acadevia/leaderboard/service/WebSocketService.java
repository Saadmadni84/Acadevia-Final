package com.acadevia.leaderboard.service;

import com.acadevia.leaderboard.dto.response.LeaderboardEntryDto;
import com.acadevia.leaderboard.util.Constants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class WebSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    public void broadcastRankChange(String userId, String leaderboardKey, long newRank, double newScore) {
        // Construct topic: /topic/leaderboard/{key}
        // or specifically to user: /topic/user/{userId}/rank-updates

        // For this implementation, we'll notify specific leaderboard subscribers
        // The key format is complex with colons, so we might need to sanitize or map it
        // Simpler approach: broadcast to /topic/leaderboard/{scope}/{scopeId}
        
        // Let's assume the client subscribes to specific leaderboard context updates
        String destination = Constants.WS_TOPIC_PREFIX + "/updates/" + leaderboardKey;
        
        LeaderboardEntryDto update = LeaderboardEntryDto.builder()
                .userId(userId)
                .rank(newRank)
                .score(newScore)
                .build();

        messagingTemplate.convertAndSend(destination, update);
    }
}
