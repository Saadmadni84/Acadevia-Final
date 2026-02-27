package com.acadevia.admin.feign;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
@FeignClient(name = "SCHOOL-REGISTRY-SERVICE", path = "/api/registry")
public interface SchoolRegistryClient {
    @PostMapping("/schools")
    ResponseEntity<Map<String, Object>> createSchool(@RequestBody Map<String, Object> request);
    @GetMapping("/schools/{schoolId}")
    ResponseEntity<Map<String, Object>> getSchool(@PathVariable String schoolId);
    @PutMapping("/schools/{schoolId}/verify")
    ResponseEntity<Map<String, String>> verifySchool(@PathVariable String schoolId);
    @PutMapping("/schools/{schoolId}/status")
    ResponseEntity<Map<String, String>> updateSchoolStatus(@PathVariable String schoolId, @RequestBody Map<String, Object> request);
}
