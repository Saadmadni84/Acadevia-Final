package com.acadevia.notification.util;

import lombok.experimental.UtilityClass;

@UtilityClass
public class Constants {

    // Kafka Consumer Group
    public static final String GROUP_ID_NOTIFICATION = "notification-service";

    // Kafka Topics Consumed
    public static final String TOPIC_BADGE_UNLOCKED = "badge.unlocked";
    public static final String TOPIC_STREAK_MILESTONE = "streak.milestone";
    public static final String TOPIC_STREAK_BROKEN = "streak.broken";
    public static final String TOPIC_RANK_CHANGED = "leaderboard.rank.changed";
    public static final String TOPIC_COURSE_COMPLETED = "course.completed";
    public static final String TOPIC_QUIZ_COMPLETED = "quiz.completed";
    public static final String TOPIC_GAME_COMPLETED = "game.completed";
    public static final String TOPIC_CLASSROOM_ANNOUNCEMENT = "classroom.announcement";
    public static final String TOPIC_ASSIGNMENT_CREATED = "classroom.assignment.created";
    public static final String TOPIC_WALLET_CREDITED = "wallet.credited";
    public static final String TOPIC_LEADERBOARD_RESET = "leaderboard.reset";
    public static final String TOPIC_XP_AWARDED = "xp.awarded";
    public static final String TOPIC_STUDENT_ONBOARDED = "student.onboarded";

    // Redis Keys
    public static final String REDIS_UNREAD_COUNT = "notification:unread:";
    public static final String REDIS_USER_PREFS = "notification:prefs:";
    public static final String REDIS_XP_BATCH = "notification:xp:batch:";

    // WebSocket
    public static final String WS_ENDPOINT = "/ws/notifications";
    public static final String WS_TOPIC_PREFIX = "/topic/notifications";
    public static final String WS_USER_PREFIX = "/user";

    // Template Keys
    public static final String TEMPLATE_BADGE_UNLOCKED = "notification.badge.unlocked";
    public static final String TEMPLATE_STREAK_MILESTONE = "notification.streak.milestone";
    public static final String TEMPLATE_STREAK_BROKEN = "notification.streak.broken";
    public static final String TEMPLATE_STREAK_WARNING = "notification.streak.warning";
    public static final String TEMPLATE_RANK_UP = "notification.leaderboard.rank.up";
    public static final String TEMPLATE_RANK_DOWN = "notification.leaderboard.rank.down";
    public static final String TEMPLATE_COURSE_COMPLETED = "notification.course.completed";
    public static final String TEMPLATE_QUIZ_COMPLETED = "notification.quiz.completed";
    public static final String TEMPLATE_GAME_COMPLETED = "notification.game.completed";
    public static final String TEMPLATE_CLASSROOM_ANNOUNCEMENT = "notification.classroom.announcement";
    public static final String TEMPLATE_ASSIGNMENT_CREATED = "notification.classroom.assignment";
    public static final String TEMPLATE_WALLET_CREDITED = "notification.wallet.credited";
    public static final String TEMPLATE_WELCOME = "notification.system.welcome";
    public static final String TEMPLATE_DAILY_XP_SUMMARY = "notification.xp.daily.summary";

    // Defaults
    public static final int DEFAULT_PAGE_SIZE = 20;
    public static final int MAX_PAGE_SIZE = 50;
    public static final String DEFAULT_LANGUAGE = "en";
}
