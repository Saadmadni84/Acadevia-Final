package com.acadevia.leaderboard.enums;

public enum GeoScope {
    GLOBAL,
    CLASSROOM,
    SCHOOL,
    CITY,
    STATE,
    NATIONAL;

    public static GeoScope fromString(String scope) {
        try {
            return GeoScope.valueOf(scope.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid geo scope: " + scope);
        }
    }
}
