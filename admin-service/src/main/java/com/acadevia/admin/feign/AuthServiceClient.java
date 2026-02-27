package com.acadevia.admin.feign;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
@FeignClient(name = "AUTH-SERVICE", path = "/api/auth")
public interface AuthServiceClient {
    @PostMapping("/admin/reset-password")
    ResponseEntity<Map<String, String>> resetPassword(@RequestBody Map<String, Object> request);
    @PutMapping("/admin/change-role")
    ResponseEntity<Map<String, String>> changeRole(@RequestBody Map<String, Object> request);
}
