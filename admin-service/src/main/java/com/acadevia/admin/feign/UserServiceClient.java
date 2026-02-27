package com.acadevia.admin.feign;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
@FeignClient(name = "USER-SERVICE", path = "/api/users")
public interface UserServiceClient {
    @GetMapping("/{userId}")
    ResponseEntity<Map<String, Object>> getUserProfile(@PathVariable Long userId);
    @PutMapping("/{userId}/status")
    ResponseEntity<Map<String, String>> updateUserStatus(@PathVariable Long userId, @RequestBody Map<String, Object> request);
}
