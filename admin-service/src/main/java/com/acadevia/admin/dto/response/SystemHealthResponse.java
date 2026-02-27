package com.acadevia.admin.dto.response;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class SystemHealthResponse {
    private String overallStatus;
    private List<ServiceStatus> services;
    private Map<String, Object> kafkaMetrics;
    private Map<String, Object> redisMetrics;
    private Map<String, Object> databaseMetrics;
    private LocalDateTime checkedAt;

    @Data @Builder
    public static class ServiceStatus {
        private String serviceName;
        private String status;
        private String url;
        private Long responseTimeMs;
        private Map<String, Object> details;
    }
}
