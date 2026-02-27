package com.acadevia.leaderboard.service;

import com.acadevia.leaderboard.dto.event.XpAwardedEvent;
import com.acadevia.leaderboard.entity.UserLeaderboardProfile;
import com.acadevia.leaderboard.enums.GeoScope;
import com.acadevia.leaderboard.enums.SubjectScope;
import com.acadevia.leaderboard.enums.TimeScope;
import com.acadevia.leaderboard.repository.RedisLeaderboardRepository;
import com.acadevia.leaderboard.repository.UserLeaderboardProfileRepository;
import com.acadevia.leaderboard.util.LeaderboardKeyBuilder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class LeaderboardUpdateService {

    private final RedisLeaderboardRepository redisRepository;
    private final UserLeaderboardProfileRepository userProfileRepository;
    private final WebSocketService webSocketService;

    @Transactional
    public void handleXpEvent(XpAwardedEvent event) {
        log.debug("Processing XP event for user: {}", event.getUserId());

        // 1. Update Persistent User Profile
        updateUserProfile(event);

        // 2. Determine Subject Scope
        SubjectScope subjectScope = resolveSubject(event.getSubject());

        // 3. Update Redis Keys for various scopes

        // --- GLOBAL ---
        updateRedisLeaderboards(event, GeoScope.GLOBAL, "world", subjectScope);

        // --- NATIONAL ---
        if (event.getCountryCode() != null) {
            updateRedisLeaderboards(event, GeoScope.NATIONAL, event.getCountryCode(), subjectScope);
        }

        // --- SCHOOL ---
        if (event.getSchoolId() != null) {
            updateRedisLeaderboards(event, GeoScope.SCHOOL, event.getSchoolId(), subjectScope);
        }
        
        // --- CITY/STATE could be added here ---
    }

    private void updateRedisLeaderboards(XpAwardedEvent event, GeoScope geoScope, String scopeValue, SubjectScope subject) {
        // Update All-Time
        updateScope(event, TimeScope.ALL_TIME, geoScope, scopeValue, subject, -1);
        
        // Update Monthly (TTL ~ 60 days)
        updateScope(event, TimeScope.MONTHLY, geoScope, scopeValue, subject, 60 * 24 * 3600);
        
        // Update Weekly (TTL ~ 14 days)
        updateScope(event, TimeScope.WEEKLY, geoScope, scopeValue, subject, 14 * 24 * 3600);
        
        // Update Daily (TTL ~ 2 days)
        updateScope(event, TimeScope.DAILY, geoScope, scopeValue, subject, 48 * 3600);
    }

    private void updateScope(XpAwardedEvent event, TimeScope timeScope, GeoScope geoScope, String scopeValue, SubjectScope subject, long ttl) {
        Integer grade = parseGrade(event.getUserGrade());
        // 1. Update Subject Specific Leaderboard (e.g., MATH)
        if (subject != null) {
            String key = LeaderboardKeyBuilder.buildKey(timeScope, geoScope, scopeValue, subject, grade);
            redisRepository.incrementScore(key, event.getUserId(), event.getXpAmount(), ttl);
            notifyWebSocket(key, event);
        }

        // 2. Update Aggregated Leaderboard (ALL subjects)
        String aggKey = LeaderboardKeyBuilder.buildKey(timeScope, geoScope, scopeValue, null, grade);
        redisRepository.incrementScore(aggKey, event.getUserId(), event.getXpAmount(), ttl);
        notifyWebSocket(aggKey, event);
    }

    private void notifyWebSocket(String key, XpAwardedEvent event) {
        // To avoid spamming, we might only notify for specific important leaderboards or use a throttle
        // For now, valid real-time requirement:
        Double newScore = redisRepository.getScore(key, event.getUserId());
        Long newRank = redisRepository.getRank(key, event.getUserId());
        
        if (newScore != null && newRank != null) {
            webSocketService.broadcastRankChange(event.getUserId(), key, newRank + 1, newScore);
        }
    }

    private void updateUserProfile(XpAwardedEvent event) {
        UserLeaderboardProfile profile = userProfileRepository.findByUserId(event.getUserId())
                .orElse(UserLeaderboardProfile.builder()
                        .userId(event.getUserId())
                        .username("User-" + event.getUserId().substring(0, 5)) // Default until enriched
                        .build());
        
        profile.setTotalXpAllTime(profile.getTotalXpAllTime() + event.getXpAmount());
        
        // Update metadata if provided in event
        if (event.getUserGrade() != null) profile.setGrade(event.getUserGrade());
        if (event.getSchoolId() != null) profile.setSchoolId(event.getSchoolId());
        
        userProfileRepository.save(profile);
    }

    private SubjectScope resolveSubject(String subject) {
        if (subject == null) return null;
        try {
            return SubjectScope.valueOf(subject.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    private Integer parseGrade(String grade) {
        if (grade == null) return null;
        try {
            return Integer.parseInt(grade);
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
