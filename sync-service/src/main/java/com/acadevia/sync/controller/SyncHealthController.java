package com.acadevia.sync.controller;

import com.acadevia.sync.dto.response.SyncHealthResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/sync/health")
@Tag(name = "Sync Health", description = "Monitoring endpoints")
public class SyncHealthController {

    @GetMapping
    public ResponseEntity<SyncHealthResponse> getHealth() {
        return ResponseEntity.ok(SyncHealthResponse.builder()
                .status("UP")
                .queueDepth(0) // Mock
                .activeDownloads(0) // Mock
                .build());
    }
}
