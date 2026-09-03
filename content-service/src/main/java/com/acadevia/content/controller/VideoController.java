package com.acadevia.content.controller;

import com.acadevia.content.dto.request.VideoCreateRequest;
import com.acadevia.content.dto.request.VideoUpdateRequest;
import com.acadevia.content.dto.response.*;
import com.acadevia.content.service.StorageService;
import com.acadevia.content.service.VideoService;
import com.acadevia.content.util.AppConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/v1/content/videos")
@RequiredArgsConstructor
public class VideoController {

    private final VideoService videoService;
    private final StorageService storageService;

    private static final Set<String> UPLOAD_ROLES = Set.of("TEACHER", "ADMIN", "INSTRUCTOR", "ROLE_TEACHER", "ROLE_ADMIN", "ROLE_INSTRUCTOR");

    // ========================================================================
    //  VIDEO UPLOAD (MinIO)
    // ========================================================================

    /**
     * Upload a video file to MinIO (acadevia-videos bucket).
     * Requires TEACHER, ADMIN, or INSTRUCTOR role.
     */
    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<VideoUploadResponse>> uploadVideo(
            @RequestParam("file") MultipartFile file,
            @RequestParam("courseId") Long courseId,
            @RequestParam("lessonId") Long lessonId,
            @RequestParam(value = "title", defaultValue = "Untitled Video") String title,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {

        // Authorization: check role
        if (userRole == null || UPLOAD_ROLES.stream().noneMatch(r -> userRole.toUpperCase().contains(r))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Access denied: only teachers and admins can upload videos"));
        }

        Long userId = parseUserId(userIdHeader);

        VideoUploadResponse response = storageService.uploadVideo(file, courseId, lessonId, title, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(response, "Video uploaded successfully"));
    }

    // ========================================================================
    //  VIDEO PLAYBACK (Presigned URL)
    // ========================================================================

    /**
     * Get a short-lived presigned URL for authorized video playback.
     * The bucket remains PRIVATE; the URL expires after the configured duration.
     */
    @GetMapping("/{videoId}/play-url")
    public ResponseEntity<ApiResponse<VideoPlayUrlResponse>> getPlayUrl(
            @PathVariable Long videoId,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {

        // Any authenticated user can request a play URL
        // (the JWT filter already validated the token at the gateway)
        VideoPlayUrlResponse response = storageService.getPlayUrl(videoId);
        return ResponseEntity.ok(ApiResponse.ok(response, "Play URL generated"));
    }

    // ========================================================================
    //  VIDEO STREAMING (HTTP Range fallback)
    // ========================================================================

    /**
     * Stream video content with HTTP Range support (206 Partial Content).
     * Used as a fallback when presigned URLs encounter CORS issues.
     */
    @GetMapping("/{videoId}/stream")
    public ResponseEntity<InputStreamResource> streamVideo(
            @PathVariable Long videoId,
            @RequestHeader(value = "Range", required = false) String rangeHeader) {

        return storageService.streamVideo(videoId, rangeHeader);
    }

    // ========================================================================
    //  EXISTING ENDPOINTS (unchanged)
    // ========================================================================

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

    // ========================================================================
    //  PRIVATE HELPERS
    // ========================================================================

    private Long parseUserId(String userIdHeader) {
        if (userIdHeader == null || userIdHeader.isBlank()) return 0L;
        try {
            return Long.parseLong(userIdHeader);
        } catch (NumberFormatException e) {
            return 0L;
        }
    }
}
