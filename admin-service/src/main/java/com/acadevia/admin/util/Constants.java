package com.acadevia.admin.util;

import lombok.experimental.UtilityClass;

@UtilityClass
public class Constants {
    // Kafka Topics Published
    public static final String TOPIC_ADMIN_ACTION = "admin.action";
    public static final String TOPIC_SCHOOL_ONBOARDED = "school.onboarded";
    public static final String TOPIC_USER_STATUS_CHANGED = "user.status.changed";
    public static final String TOPIC_CONTENT_APPROVED = "content.approved";
    public static final String TOPIC_RULE_UPDATED = "gamification.rule.updated";
    public static final String TOPIC_ANNOUNCEMENT_BROADCAST = "announcement.broadcast";
    public static final String TOPIC_MAINTENANCE_MODE = "platform.maintenance";

    // Redis Keys
    public static final String CACHE_FEATURE_FLAGS = "admin:feature:flags";
    public static final String CACHE_PLATFORM_SETTINGS = "admin:platform:settings";
    public static final String CACHE_GAMIFICATION_RULES = "admin:gamification:rules";
    public static final String CACHE_DASHBOARD = "admin:dashboard:stats";
}
