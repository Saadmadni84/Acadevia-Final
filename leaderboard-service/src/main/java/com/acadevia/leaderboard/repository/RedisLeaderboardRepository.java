package com.acadevia.leaderboard.repository;

import com.acadevia.leaderboard.enums.GeoScope;
import com.acadevia.leaderboard.enums.SubjectScope;
import com.acadevia.leaderboard.enums.TimeScope;
import com.acadevia.leaderboard.util.LeaderboardKeyBuilder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.stereotype.Repository;

import java.util.Set;
import java.util.concurrent.TimeUnit;

@Slf4j
@Repository
@RequiredArgsConstructor
public class RedisLeaderboardRepository {

    private final RedisTemplate<String, Object> redisTemplate;

    // Default TTL for daily keys: 2 days (to allow for end-of-day processing)
    // Weekly: 14 days
    // Monthly: 60 days
    // All-time: No expiry or very long

    public void incrementScore(String key, String userId, double score, long ttlSeconds) {
        redisTemplate.opsForZSet().incrementScore(key, userId, score);
        if (ttlSeconds > 0) {
            redisTemplate.expire(key, ttlSeconds, TimeUnit.SECONDS);
        }
    }

    public Set<ZSetOperations.TypedTuple<Object>> getTopRange(String key, long start, long end) {
        return redisTemplate.opsForZSet().reverseRangeWithScores(key, start, end);
    }

    public Long getRank(String key, String userId) {
        return redisTemplate.opsForZSet().reverseRank(key, userId);
    }

    public Double getScore(String key, String userId) {
        return redisTemplate.opsForZSet().score(key, userId);
    }

    public Long getCount(String key) {
        return redisTemplate.opsForZSet().zCard(key);
    }

    // Helper wrapper using enums directly if needed, but usually service calls KeyBuilder
    // We'll keep this low-level focused on Redis operations.
}
