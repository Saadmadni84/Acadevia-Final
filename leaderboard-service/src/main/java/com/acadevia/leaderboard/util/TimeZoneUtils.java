package com.acadevia.leaderboard.util;

import lombok.experimental.UtilityClass;

import java.time.*;
import java.time.temporal.TemporalAdjusters;

@UtilityClass
public class TimeZoneUtils {

    private static final ZoneId IST = ZoneId.of("Asia/Kolkata");

    public static LocalDate todayIST() {
        return LocalDate.now(IST);
    }

    public static LocalDateTime nowIST() {
        return LocalDateTime.now(IST);
    }

    public static LocalDate startOfWeekIST() {
        return todayIST().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
    }

    public static LocalDate startOfMonthIST() {
        return todayIST().with(TemporalAdjusters.firstDayOfMonth());
    }

    public static boolean isNewDay(LocalDateTime lastActivity) {
        return lastActivity.toLocalDate().isBefore(todayIST());
    }

    public static boolean isNewWeek(LocalDateTime lastActivity) {
        LocalDate lastDate = lastActivity.toLocalDate();
        LocalDate currentWeekStart = startOfWeekIST();
        return lastDate.isBefore(currentWeekStart);
    }

    public static boolean isNewMonth(LocalDateTime lastActivity) {
        LocalDate lastDate = lastActivity.toLocalDate();
        LocalDate currentMonthStart = startOfMonthIST();
        return lastDate.isBefore(currentMonthStart);
    }
}
