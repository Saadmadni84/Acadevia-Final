package com.acadevia.content.util;

public final class AppConstants {

    private AppConstants() {
    }

    // Pagination defaults
    public static final String DEFAULT_PAGE_NUMBER = "0";
    public static final String DEFAULT_PAGE_SIZE = "10";
    public static final String DEFAULT_SORT_BY = "createdAt";
    public static final String DEFAULT_SORT_DIRECTION = "desc";
    public static final String DEFAULT_SORT_DIR = "desc";

    // Kafka topics
    public static final String TOPIC_VIDEO_COMPLETED = "video.completed";
    public static final String TOPIC_POP_ANSWERED = "video.pop-answered";
    public static final String TOPIC_VIDEO_DOWNLOADED = "video.downloaded";

    // Video constants
    public static final int MAX_VIDEO_TITLE_LENGTH = 255;
    public static final int MAX_BOOKMARK_TITLE_LENGTH = 200;
    public static final int DEFAULT_POP_QUESTION_TIME_LIMIT = 30;
    public static final int DEFAULT_POP_QUESTION_XP = 5;

    // Download constants
    public static final int MAX_DOWNLOADS_PER_USER = 50;
    public static final int MAX_DOWNLOADS_PER_DEVICE = 10;
    public static final int DOWNLOAD_TOKEN_EXPIRY_HOURS = 24;
    public static final int DOWNLOAD_EXPIRY_DAYS = 30;
    public static final int MAX_DOWNLOAD_RETRIES = 3;

    // Watch progress constants
    public static final double COMPLETION_THRESHOLD_PERCENTAGE = 90.0;

    // Cache keys
    public static final String CACHE_VIDEO_PREFIX = "video:";
    public static final String CACHE_VIDEO_LIST_PREFIX = "video:list:";
    public static final String CACHE_LESSON_CONTENT_PREFIX = "lesson:content:";
    public static final String CACHE_COURSE_CONTENT_PREFIX = "course:content:";
    public static final long CACHE_TTL_SECONDS = 3600;

    // XP constants
    public static final int XP_FIRST_CORRECT = 10;
    public static final int XP_CORRECT_ANSWER = 5;
    public static final int XP_VIDEO_COMPLETE = 15;
    public static final int XP_FIRST_BOOKMARK = 2;
    public static final int XP_FIRST_NOTE = 3;
}
