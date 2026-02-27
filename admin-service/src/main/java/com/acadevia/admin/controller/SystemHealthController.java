package com.acadevia.admin.controller;

import com.acadevia.admin.dto.response.SystemHealthResponse;
import com.acadevia.admin.service.SystemHealthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/health")
@RequiredArgsConstructor
@Tag(name = "System Health", description = "Monitor microservices health")
@PreAuthorize("hasRole('ADMIN')")
public class SystemHealthController {

    private final SystemHealthService healthService;

    @GetMapping
    @Operation(summary = "Check health of all services")
    public ResponseEntity<SystemHealthResponse> checkSystemHealth() {
        return ResponseEntity.ok(healthService.checkAllServices());
    }
}
