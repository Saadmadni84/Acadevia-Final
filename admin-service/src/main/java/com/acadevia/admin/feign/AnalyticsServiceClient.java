package com.acadevia.admin.feign;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
@FeignClient(name = "ANALYTICS-SERVICE", path = "/api/analytics")
public interface AnalyticsServiceClient {
    @GetMapping("/platform/stats")
    ResponseEntity<Map<String, Object>> getPlatformStats();
}
