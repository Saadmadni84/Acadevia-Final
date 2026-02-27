package com.acadevia.leaderboard.service.impl;

import com.acadevia.leaderboard.dto.response.LeaderboardEntryDto;
import com.acadevia.leaderboard.dto.response.LeaderboardResponse;
import com.acadevia.leaderboard.entity.UserLeaderboardProfile;
import com.acadevia.leaderboard.enums.GeoScope;
import com.acadevia.leaderboard.enums.SubjectScope;
import com.acadevia.leaderboard.enums.TimeScope;
import com.acadevia.leaderboard.repository.RedisLeaderboardRepository;
import com.acadevia.leaderboard.repository.UserLeaderboardProfileRepository;
import com.acadevia.leaderboard.service.LeaderboardService;
import com.acadevia.leaderboard.util.LeaderboardKeyBuilder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class LeaderboardServiceImpl implements LeaderboardService {

    private final RedisLeaderboardRepository redisRepository;
    private final UserLeaderboardProfileRepository userProfileRepository;

    @Override
    public LeaderboardResponse getLeaderboard(TimeScope timeScope, GeoScope geoScope, String scopeValue, 
                                            SubjectScope subject, int page, int size, String requestingUserId) {
        
        // 1. Construct Redis Key
        String key = LeaderboardKeyBuilder.buildKey(timeScope, geoScope, scopeValue, subject, null);

        // 2. Fetch Range from Redis
        long start = (long) page * size;
        long end = start + size - 1;
        Set<ZSetOperations.TypedTuple<Object>> range = redisRepository.getTopRange(key, start, end);

        if (range == null || range.isEmpty()) {
            return buildEmptyResponse(timeScope, geoScope, scopeValue, subject);
        }

        // 3. Extract User IDs
        List<String> userIds = range.stream()
                .map(tuple -> (String) tuple.getValue())
                .collect(Collectors.toList());

        // 4. Batch Fetch User Profiles
        List<UserLeaderboardProfile> profiles = userProfileRepository.findAllById(userIds);
        Map<String, UserLeaderboardProfile> profileMap = profiles.stream()
                .collect(Collectors.toMap(UserLeaderboardProfile::getUserId, Function.identity()));

        // 5. Build DTOs
        List<LeaderboardEntryDto> entries = new ArrayList<>();
        int currentRank = (int) start + 1;

        for (ZSetOperations.TypedTuple<Object> tuple : range) {
            String userId = (String) tuple.getValue();
            Double score = tuple.getScore();
            UserLeaderboardProfile profile = profileMap.get(userId);

            entries.add(LeaderboardEntryDto.builder()
                    .rank(currentRank++)
                    .userId(userId)
                    .username(profile != null ? profile.getUsername() : "Unknown")
                    .avatarUrl(profile != null ? profile.getAvatarUrl() : null)
                    .score(score != null ? score : 0)
                    .build());
        }

        // 6. Requesting User's specific rank (if not in top list)
        LeaderboardEntryDto userEntry = null;
        if (requestingUserId != null) {
            Long rank = redisRepository.getRank(key, requestingUserId);
            Double score = redisRepository.getScore(key, requestingUserId);
            if (rank != null) {
                UserLeaderboardProfile userProfile = userProfileRepository.findByUserId(requestingUserId).orElse(null);
                userEntry = LeaderboardEntryDto.builder()
                        .rank(rank + 1)
                        .userId(requestingUserId)
                        .username(userProfile != null ? userProfile.getUsername() : "Unknown")
                        .avatarUrl(userProfile != null ? userProfile.getAvatarUrl() : null)
                        .score(score != null ? score : 0)
                        .build();
            }
        }

        Long total = redisRepository.getCount(key);

        return LeaderboardResponse.builder()
                .timeScope(timeScope)
                .geoScope(geoScope)
                .scopeValue(scopeValue)
                .subject(subject != null ? subject.toString() : "ALL")
                .entries(entries)
                .userEntry(userEntry)
                .totalParticipants(total != null ? total : 0)
                .build();
    }

    @Override
    public LeaderboardResponse getGlobalLeaderboard(int page, int size) {
        return getLeaderboard(TimeScope.ALL_TIME, GeoScope.GLOBAL, "world", null, page, size, null);
    }

    private LeaderboardResponse buildEmptyResponse(TimeScope timeScope, GeoScope geoScope, String scopeValue, SubjectScope subject) {
        return LeaderboardResponse.builder()
                .timeScope(timeScope)
                .geoScope(geoScope)
                .scopeValue(scopeValue)
                .subject(subject != null ? subject.toString() : "ALL")
                .entries(Collections.emptyList())
                .totalParticipants(0)
                .build();
    }
}
