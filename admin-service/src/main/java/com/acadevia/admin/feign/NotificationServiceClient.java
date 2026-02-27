package com.acadevia.admin.feign;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
@FeignClient(name = "NOTIFICATION-SERVICE", path = "/api/notifications")
public interface NotificationServiceClient {
    @PostMapping("/send")
    ResponseEntity<Map<String, Object>> sendNotification(@RequestBody Map<String, Object> request);
}
