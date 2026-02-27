package com.acadevia.leaderboard.util;

import lombok.experimental.UtilityClass;

@UtilityClass
public class Constants {

    // Kafka Topics
    public static final String TOPIC_XP_AWARDED = "xp.awarded";
    public static final String TOPIC_USER_ONBOARDED = "student.onboarded";
    public static final String TOPIC_GAME_COMPLETED = "game.completed";
    public static final String TOPIC_QUIZ_COMPLETED = "quiz.completed";
    public static final String TOPIC_RANK_CHANGED = "leaderboard.rank.changed";
    public static final String TOPIC_LEADERBOARD_RESET = "leaderboard.reset";

    // Redis
    public static final String NATIONAL_SCOPE_ID = "IN";
    public static final long USER_DISPLAY_CACHE_TTL = 1800; // 30 min
    public static final long LEADERBOARD_PAGE_CACHE_TTL = 60; // 1 min

    // Pagination
    public static final int DEFAULT_PAGE_SIZE = 20;
    public static final int MAX_PAGE_SIZE = 100;
    public static final int DEFAULT_TOP_N = 10;
    public static final int NEARBY_RANGE = 5;

    // WebSocket
    public static final String WS_ENDPOINT = "/ws/leaderboard";
    public static final String WS_TOPIC_PREFIX = "/topic/leaderboard";
    public static final String WS_APP_PREFIX = "/app";

    // Time Zone
    public static final String IST_ZONE = "Asia/Kolkata";
}
