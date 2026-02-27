package com.acadevia.sync.controller;

import com.acadevia.sync.dto.request.ChunkCompleteRequest;
import com.acadevia.sync.dto.request.DownloadRequest;
import com.acadevia.sync.dto.response.DownloadManifestResponse;
import com.acadevia.sync.service.DownloadManagerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/downloads")
@RequiredArgsConstructor
public class DownloadController {

    private final DownloadManagerService downloadManagerService;

    @PostMapping("/initiate")
    public ResponseEntity<DownloadManifestResponse> initiate(@RequestHeader("X-User-Id") Long userId,
                                                             @RequestBody DownloadRequest request) {
        return ResponseEntity.ok(downloadManagerService.initiateDownload(userId, request));
    }

    @PostMapping("/{manifestId}/chunk/complete")
    public ResponseEntity<Void> completeChunk(@RequestHeader("X-User-Id") Long userId,
                                              @PathVariable Long manifestId,
                                              @RequestBody ChunkCompleteRequest request) {
        downloadManagerService.completeChunk(userId, manifestId, request);
        return ResponseEntity.ok().build();
    }
}
