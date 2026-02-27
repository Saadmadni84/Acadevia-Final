package com.acadevia.course.util;

public class ProgressCalculator {

    public static double calculateCourseProgress(int completedMandatory, int totalMandatory) {
        if (totalMandatory == 0) {
            return 0.0;
        }
        double progress = ((double) completedMandatory / totalMandatory) * 100.0;
        return Math.min(100.0, Math.round(progress * 100.0) / 100.0); // Round to 2 decimals
    }

    public static double calculateModuleProgress(int completedInModule, int totalInModule) {
        if (totalInModule == 0) {
            return 0.0;
        }
        double progress = ((double) completedInModule / totalInModule) * 100.0;
        return Math.min(100.0, Math.round(progress * 100.0) / 100.0);
    }

    public static boolean isCourseComplete(double progressPct) {
        return progressPct >= 100.0;
    }
}
