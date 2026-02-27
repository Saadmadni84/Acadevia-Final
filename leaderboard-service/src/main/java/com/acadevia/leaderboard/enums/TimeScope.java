package com.acadevia.leaderboard.enums;

public enum TimeScope {
    DAILY,
    WEEKLY,
    MONTHLY,
    ALL_TIME;

    public static TimeScope fromString(String scope) {
        try {
            return TimeScope.valueOf(scope.toUpperCase().replace("-", "_"));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid time scope: " + scope);
        }
    }
}
