package com.acadevia.content.controller;

import com.acadevia.content.dto.request.DownloadRequest;
import com.acadevia.content.dto.response.ApiResponse;
import com.acadevia.content.dto.response.DownloadResponse;
import com.acadevia.content.dto.response.PageResponse;
import com.acadevia.content.service.DownloadService;
import com.acadevia.content.util.AppConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/content/downloads")
@RequiredArgsConstructor
public class DownloadController {

    private final DownloadService downloadService;

    @PostMapping
    public ResponseEntity<ApiResponse<DownloadResponse>> requestDownload(
            @Valid @RequestBody DownloadRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(downloadService.requestDownload(request), "Download requested"));
    }

    @GetMapping("/{downloadId}")
    public ResponseEntity<ApiResponse<DownloadResponse>> getDownload(@PathVariable Long downloadId) {
        return ResponseEntity.ok(ApiResponse.ok(downloadService.getDownloadById(downloadId)));
    }

    @GetMapping("/token/{token}")
    public ResponseEntity<ApiResponse<DownloadResponse>> getDownloadByToken(@PathVariable String token) {
        return ResponseEntity.ok(ApiResponse.ok(downloadService.getDownloadByToken(token)));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<PageResponse<DownloadResponse>>> getUserDownloads(
            @PathVariable Long userId,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_NUMBER) int pageNo,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_SIZE) int pageSize) {
        return ResponseEntity.ok(ApiResponse.ok(downloadService.getUserDownloads(userId, pageNo, pageSize)));
    }

    @GetMapping("/user/{userId}/active")
    public ResponseEntity<ApiResponse<List<DownloadResponse>>> getActiveDownloads(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(downloadService.getActiveDownloads(userId)));
    }

    @PatchMapping("/{downloadId}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelDownload(@PathVariable Long downloadId) {
        downloadService.cancelDownload(downloadId);
        return ResponseEntity.ok(ApiResponse.ok(null, "Download cancelled"));
    }

    @PatchMapping("/{downloadId}/retry")
    public ResponseEntity<ApiResponse<Void>> retryDownload(@PathVariable Long downloadId) {
        downloadService.retryDownload(downloadId);
        return ResponseEntity.ok(ApiResponse.ok(null, "Download retry queued"));
    }

    @DeleteMapping("/{downloadId}")
    public ResponseEntity<ApiResponse<Void>> deleteDownload(@PathVariable Long downloadId) {
        downloadService.deleteDownload(downloadId);
        return ResponseEntity.ok(ApiResponse.ok(null, "Download deleted"));
    }
}
