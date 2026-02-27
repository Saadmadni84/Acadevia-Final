package com.acadevia.leaderboard.util;

import com.acadevia.leaderboard.enums.GeoScope;
import com.acadevia.leaderboard.enums.SubjectScope;
import com.acadevia.leaderboard.enums.TimeScope;
import lombok.experimental.UtilityClass;

@UtilityClass
public class LeaderboardKeyBuilder {

    private static final String PREFIX = "leaderboard";
    private static final String SEPARATOR = ":";
    private static final String USER_META_PREFIX = "user:leaderboard:meta";
    private static final String USER_DISPLAY_PREFIX = "user:display";
    private static final String PUBSUB_PREFIX = "leaderboard:updates";

    /**
     * Build Redis sorted set key for leaderboard
     * Format: leaderboard:{timeScope}:{geoScope}:{scopeId}:{subject}:{grade}
     *
     * Examples:
     *   leaderboard:alltime:national:IN:overall:10
     *   leaderboard:weekly:state:MH:math:8
     *   leaderboard:daily:school:SCH001:science:9
     *   leaderboard:monthly:classroom:CLS_SCH001_10A:overall:10
     */
    public static String buildKey(TimeScope timeScope, GeoScope geoScope,
                                   String scopeId, SubjectScope subject, Integer grade) {
        return String.join(SEPARATOR,
                PREFIX,
                timeScope.name().toLowerCase(),
                geoScope.name().toLowerCase(),
                scopeId != null ? scopeId.toLowerCase() : "all",
                subject != null ? subject.name().toLowerCase() : "overall",
                grade != null ? String.valueOf(grade) : "all"
        );
    }

    /**
     * Build all leaderboard keys for a user's scope
     * When XP is awarded, we need to update ALL relevant leaderboards
     */
    public static String[] buildAllKeysForUser(
            String classroomId, String schoolId, String cityId,
            String stateId, SubjectScope subject, Integer grade, TimeScope timeScope) {

        return new String[]{
                buildKey(timeScope, GeoScope.CLASSROOM, classroomId, subject, grade),
                buildKey(timeScope, GeoScope.SCHOOL, schoolId, subject, grade),
                buildKey(timeScope, GeoScope.CITY, cityId, subject, grade),
                buildKey(timeScope, GeoScope.STATE, stateId, subject, grade),
                buildKey(timeScope, GeoScope.NATIONAL, "IN", subject, grade)
        };
    }

    /**
     * Build all time-scope keys for a specific geo scope
     */
    public static String[] buildAllTimeScopeKeys(
            GeoScope geoScope, String scopeId, SubjectScope subject, Integer grade) {

        return new String[]{
                buildKey(TimeScope.DAILY, geoScope, scopeId, subject, grade),
                buildKey(TimeScope.WEEKLY, geoScope, scopeId, subject, grade),
                buildKey(TimeScope.MONTHLY, geoScope, scopeId, subject, grade),
                buildKey(TimeScope.ALL_TIME, geoScope, scopeId, subject, grade)
        };
    }

    public static String buildUserMetaKey(Long userId) {
        return USER_META_PREFIX + SEPARATOR + userId;
    }

    public static String buildUserDisplayKey(Long userId) {
        return USER_DISPLAY_PREFIX + SEPARATOR + userId;
    }

    public static String buildPubSubChannel(GeoScope geoScope, String scopeId, Integer grade) {
        return String.join(SEPARATOR,
                PUBSUB_PREFIX,
                geoScope.name().toLowerCase(),
                scopeId.toLowerCase(),
                grade != null ? String.valueOf(grade) : "all"
        );
    }

    public static String buildWebSocketDestination(GeoScope geoScope, String scopeId, Integer grade) {
        return String.format("/topic/leaderboard/%s/%s/%s",
                geoScope.name().toLowerCase(), scopeId.toLowerCase(), grade != null ? grade : "all");
    }

    /**
     * Parse a leaderboard key back into components
     */
    public static LeaderboardKeyComponents parseKey(String key) {
        String[] parts = key.split(SEPARATOR);
        if (parts.length != 6) {
            throw new IllegalArgumentException("Invalid leaderboard key: " + key);
        }
        return LeaderboardKeyComponents.builder()
                .timeScope(TimeScope.fromString(parts[1]))
                .geoScope(GeoScope.fromString(parts[2]))
                .scopeId(parts[3])
                .subjectScope(SubjectScope.fromString(parts[4]))
                .grade(Integer.parseInt(parts[5]))
                .build();
    }

    @lombok.Builder
    @lombok.Data
    public static class LeaderboardKeyComponents {
        private TimeScope timeScope;
        private GeoScope geoScope;
        private String scopeId;
        private SubjectScope subjectScope;
        private int grade;
    }
}
