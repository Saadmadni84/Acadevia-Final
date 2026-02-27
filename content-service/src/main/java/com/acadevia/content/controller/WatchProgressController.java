package com.acadevia.content.controller;

import com.acadevia.content.dto.request.WatchProgressUpdateRequest;
import com.acadevia.content.dto.response.ApiResponse;
import com.acadevia.content.dto.response.UserVideoProgressResponse;
import com.acadevia.content.dto.response.WatchProgressResponse;
import com.acadevia.content.service.WatchProgressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/content/watch-progress")
@RequiredArgsConstructor
public class WatchProgressController {

    private final WatchProgressService watchProgressService;

    @PostMapping
    public ResponseEntity<ApiResponse<WatchProgressResponse>> updateProgress(
            @Valid @RequestBody WatchProgressUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(watchProgressService.updateWatchProgress(request), "Progress updated"));
    }

    @GetMapping("/video/{videoId}/user/{userId}")
    public ResponseEntity<ApiResponse<WatchProgressResponse>> getProgress(
            @PathVariable Long videoId, @PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(watchProgressService.getWatchProgress(videoId, userId)));
    }

    @GetMapping("/user/{userId}/history")
    public ResponseEntity<ApiResponse<List<WatchProgressResponse>>> getUserHistory(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(watchProgressService.getUserWatchHistory(userId)));
    }

    @GetMapping("/user/{userId}/completed")
    public ResponseEntity<ApiResponse<List<WatchProgressResponse>>> getCompleted(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(watchProgressService.getCompletedVideos(userId)));
    }

    @GetMapping("/user/{userId}/in-progress")
    public ResponseEntity<ApiResponse<List<WatchProgressResponse>>> getInProgress(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(watchProgressService.getInProgressVideos(userId)));
    }

    @GetMapping("/video/{videoId}/user/{userId}/detail")
    public ResponseEntity<ApiResponse<UserVideoProgressResponse>> getUserVideoProgress(
            @PathVariable Long videoId, @PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(watchProgressService.getUserVideoProgress(videoId, userId)));
    }

    @GetMapping("/course/{courseId}/user/{userId}")
    public ResponseEntity<ApiResponse<Double>> getCourseProgress(
            @PathVariable Long courseId, @PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(watchProgressService.getCourseWatchProgress(courseId, userId)));
    }

    @GetMapping("/lesson/{lessonId}/user/{userId}")
    public ResponseEntity<ApiResponse<Double>> getLessonProgress(
            @PathVariable Long lessonId, @PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(watchProgressService.getLessonWatchProgress(lessonId, userId)));
    }
}
