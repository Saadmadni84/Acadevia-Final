package com.acadevia.admin.controller;

import com.acadevia.admin.feign.AnalyticsServiceClient;
import com.acadevia.admin.dto.response.AdminDashboardResponse;
import com.acadevia.admin.service.ContentModerationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

    private final AnalyticsServiceClient analyticsClient;
    private final ContentModerationService moderationService;

    @GetMapping("/stats")
    public ResponseEntity<AdminDashboardResponse> getDashboardStats() {
        // Fetch stats from analytics
        Map<String, Object> stats = analyticsClient.getPlatformStats().getBody();
        if (stats == null) stats = Map.of();

        // Get local stats
        Long pendingReviews = moderationService.countPendingReviews();

        AdminDashboardResponse response = AdminDashboardResponse.builder()
                .totalStudents(getLong(stats, "totalUsers"))
                .dailyActiveUsers(getLong(stats, "dailyActiveUsers"))
                .newUsersToday(getLong(stats, "newSignupsToday"))
                .totalSchools(getLong(stats, "totalSchools"))
                .pendingContentReviews(pendingReviews)
                .build();

        return ResponseEntity.ok(response);
    }
    
    // Helper to safely cast
    private Long getLong(Map<String, Object> map, String key) {
        Object val = map.get(key);
        if (val instanceof Number) return ((Number) val).longValue();
        return 0L;
    }

    private Double getDouble(Map<String, Object> map, String key) {
        Object val = map.get(key);
        if (val instanceof Number) return ((Number) val).doubleValue();
        return 0.0;
    }
}
