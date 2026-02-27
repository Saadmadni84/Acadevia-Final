package com.acadevia.content.controller;

import com.acadevia.content.dto.request.VideoCreateRequest;
import com.acadevia.content.dto.request.VideoUpdateRequest;
import com.acadevia.content.dto.response.*;
import com.acadevia.content.service.VideoService;
import com.acadevia.content.util.AppConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/content/videos")
@RequiredArgsConstructor
public class VideoController {

    private final VideoService videoService;

    @PostMapping
    public ResponseEntity<ApiResponse<VideoResponse>> createVideo(@Valid @RequestBody VideoCreateRequest request) {
        VideoResponse video = videoService.createVideo(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(video, "Video created successfully"));
    }

    @PutMapping("/{videoId}")
    public ResponseEntity<ApiResponse<VideoResponse>> updateVideo(
            @PathVariable Long videoId, @Valid @RequestBody VideoUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(videoService.updateVideo(videoId, request), "Video updated"));
    }

    @GetMapping("/{videoId}")
    public ResponseEntity<ApiResponse<VideoDetailResponse>> getVideoDetail(@PathVariable Long videoId) {
        return ResponseEntity.ok(ApiResponse.ok(videoService.getVideoDetail(videoId)));
    }

    @GetMapping("/{videoId}/summary")
    public ResponseEntity<ApiResponse<VideoSummaryResponse>> getVideoSummary(@PathVariable Long videoId) {
        return ResponseEntity.ok(ApiResponse.ok(videoService.getVideoById(videoId)));
    }

    @DeleteMapping("/{videoId}")
    public ResponseEntity<ApiResponse<Void>> deleteVideo(@PathVariable Long videoId) {
        videoService.deleteVideo(videoId);
        return ResponseEntity.ok(ApiResponse.ok(null, "Video deleted"));
    }

    @GetMapping("/lesson/{lessonId}")
    public ResponseEntity<ApiResponse<PageResponse<VideoSummaryResponse>>> getVideosByLesson(
            @PathVariable Long lessonId,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_NUMBER) int pageNo,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_SIZE) int pageSize,
            @RequestParam(defaultValue = AppConstants.DEFAULT_SORT_BY) String sortBy,
            @RequestParam(defaultValue = AppConstants.DEFAULT_SORT_DIR) String sortDir) {
        return ResponseEntity.ok(ApiResponse.ok(videoService.getVideosByLessonId(lessonId, pageNo, pageSize, sortBy, sortDir)));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<ApiResponse<PageResponse<VideoSummaryResponse>>> getVideosByCourse(
            @PathVariable Long courseId,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_NUMBER) int pageNo,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_SIZE) int pageSize,
            @RequestParam(defaultValue = AppConstants.DEFAULT_SORT_BY) String sortBy,
            @RequestParam(defaultValue = AppConstants.DEFAULT_SORT_DIR) String sortDir) {
        return ResponseEntity.ok(ApiResponse.ok(videoService.getVideosByCourseId(courseId, pageNo, pageSize, sortBy, sortDir)));
    }

    @GetMapping("/lesson/{lessonId}/content")
    public ResponseEntity<ApiResponse<LessonContentResponse>> getLessonContent(@PathVariable Long lessonId) {
        return ResponseEntity.ok(ApiResponse.ok(videoService.getLessonContent(lessonId)));
    }

    @GetMapping("/course/{courseId}/content")
    public ResponseEntity<ApiResponse<CourseContentResponse>> getCourseContent(@PathVariable Long courseId) {
        return ResponseEntity.ok(ApiResponse.ok(videoService.getCourseContent(courseId)));
    }

    @PatchMapping("/{videoId}/view")
    public ResponseEntity<ApiResponse<Void>> incrementView(@PathVariable Long videoId) {
        videoService.incrementViewCount(videoId);
        return ResponseEntity.ok(ApiResponse.ok(null, "View counted"));
    }

    @GetMapping("/{videoId}/stats")
    public ResponseEntity<ApiResponse<VideoStatsResponse>> getVideoStats(@PathVariable Long videoId) {
        return ResponseEntity.ok(ApiResponse.ok(videoService.getVideoStats(videoId)));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<PageResponse<VideoSummaryResponse>>> searchVideos(
            @RequestParam String keyword,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_NUMBER) int pageNo,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_SIZE) int pageSize) {
        return ResponseEntity.ok(ApiResponse.ok(videoService.searchVideos(keyword, pageNo, pageSize)));
    }
}
