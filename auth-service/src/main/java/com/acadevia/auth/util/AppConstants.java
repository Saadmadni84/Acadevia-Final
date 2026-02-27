package com.acadevia.auth.util;

public class AppConstants {
    public static final int BCRYPT_STRENGTH = 12;
    public static final int MAX_LOGIN_ATTEMPTS = 5;
    public static final int ACCOUNT_LOCK_DURATION_MINUTES = 15;
    public static final int PASSWORD_RESET_TOKEN_EXPIRY_HOURS = 1;
    public static final String KAFKA_TOPIC_USER_REGISTERED = "acadevia.user.registered";
    public static final String KAFKA_TOPIC_USER_LOGGED_IN = "acadevia.user.logged-in";
    public static final String KAFKA_TOPIC_PASSWORD_RESET = "acadevia.user.password-reset";
    public static final String HEADER_USER_ID = "X-User-Id";
    public static final String HEADER_USER_EMAIL = "X-User-Email";
    public static final String HEADER_USER_ROLE = "X-User-Role";
}
