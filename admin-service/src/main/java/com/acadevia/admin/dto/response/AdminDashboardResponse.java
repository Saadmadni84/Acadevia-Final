package com.acadevia.admin.dto.response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class AdminDashboardResponse {
    // Overview
    private Long totalStudents;
    private Long totalTeachers;
    private Long totalSchools;
    private Long totalStates;
    private Long dailyActiveUsers;
    private Long newUsersToday;

    // Content
    private Long pendingContentReviews;
    private Long totalCourses;
    private Long totalQuizzes;
    private Long totalGames;

    // Engagement
    private Double platformEngagementRate;
    private Double averageQuizScore;
    private Long totalXpToday;

    // Health
    private List<ServiceHealth> serviceHealthList;
    private Integer healthyServices;
    private Integer unhealthyServices;

    // Recent Activity
    private List<RecentAdminAction> recentActions;

    // Alerts
    private List<AdminAlert> alerts;

    private LocalDateTime lastUpdated;

    @Data @Builder
    public static class ServiceHealth {
        private String serviceName;
        private String status;
        private Long responseTimeMs;
        private String lastChecked;
    }

    @Data @Builder
    public static class RecentAdminAction {
        private String adminName;
        private String action;
        private String description;
        private String timeAgo;
    }

    @Data @Builder
    public static class AdminAlert {
        private String alertType;
        private String message;
        private String severity;
    }
}
