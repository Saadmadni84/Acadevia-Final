package com.acadevia.leaderboard.enums;

public enum SubjectScope {
    OVERALL,
    MATHEMATICS,
    SCIENCE,
    ENGLISH,
    HINDI,
    SOCIAL_SCIENCE,
    COMPUTER_SCIENCE,
    PHYSICS,
    CHEMISTRY,
    BIOLOGY;

    public static SubjectScope fromString(String scope) {
        try {
            return SubjectScope.valueOf(scope.toUpperCase().replace(" ", "_"));
        } catch (IllegalArgumentException e) {
            return OVERALL;
        }
    }
}
