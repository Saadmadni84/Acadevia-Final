package com.acadevia.admin.controller;

import com.acadevia.admin.dto.request.GamificationRuleRequest;
import com.acadevia.admin.dto.response.GamificationRuleResponse;
import com.acadevia.admin.enums.AdminRole;
import com.acadevia.admin.enums.RuleType;
import com.acadevia.admin.service.GamificationConfigService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/gamification")
@RequiredArgsConstructor
@Tag(name = "Gamification Configuration", description = "Manage XP rules and rewards")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
public class GamificationConfigController {

    private final GamificationConfigService configService;

    @GetMapping("/rules")
    @Operation(summary = "Get all gamification rules")
    public ResponseEntity<List<GamificationRuleResponse>> getAllRules() {
        return ResponseEntity.ok(configService.getAllRules());
    }

    @GetMapping("/rules/{type}")
    public ResponseEntity<GamificationRuleResponse> getRule(@PathVariable RuleType type) {
        return ResponseEntity.ok(configService.getRule(type));
    }

    @PutMapping("/rules")
    @Operation(summary = "Update a gamification rule")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<GamificationRuleResponse> updateRule(
            @RequestBody GamificationRuleRequest request,
            @RequestHeader(name = "X-Admin-ID", required = false, defaultValue = "1") Long adminId) {
        return ResponseEntity.ok(configService.updateRule(request, adminId));
    }
}
