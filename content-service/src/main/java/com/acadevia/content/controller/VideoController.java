package com.acadevia.content.controller;

import com.acadevia.content.dto.request.CreateCommentRequest;
import com.acadevia.content.dto.request.ReplyCommentRequest;
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
            @RequestParam(value = "courseId", required = false) Long courseId,
            @RequestParam(value = "moduleId", required = false) Long moduleId,
            @RequestParam(value = "lessonId", required = false) Long lessonId,
            @RequestParam(value = "classGrade", required = false) Integer classGrade,
            @RequestParam(value = "subject", required = false) String subject,
            @RequestParam(value = "chapter", required = false) String chapter,
            @RequestParam(value = "title", defaultValue = "Untitled Video") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {

        // Authorization: check role
        if (userRole == null || UPLOAD_ROLES.stream().noneMatch(r -> userRole.toUpperCase().contains(r))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Access denied: only teachers and admins can upload videos"));
        }

        Long userId = parseUserId(userIdHeader);

        VideoUploadResponse response = storageService.uploadVideo(
                file, courseId, moduleId, lessonId, classGrade, subject, chapter, title, description, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(response, "Video uploaded successfully"));
    }

    // ========================================================================
    //  TEACHER CONTENT MANAGEMENT (HISTORY, EDIT, DELETE)
    // ========================================================================

    /**
     * Get published videos for the current teacher (or all videos for admin).
     */
    @GetMapping("/my-content")
    public ResponseEntity<ApiResponse<List<VideoSummaryResponse>>> getMyContent(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {

        if (userRole == null || UPLOAD_ROLES.stream().noneMatch(r -> userRole.toUpperCase().contains(r))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Access denied: only teachers and admins can view published content management"));
        }

        Long userId = parseUserId(userIdHeader);
        List<VideoSummaryResponse> videos = storageService.getVideosByInstructor(userId, userRole);
        return ResponseEntity.ok(ApiResponse.ok(videos));
    }

    /**
     * Edit video metadata (title, description, syllabus).
     */
    @PutMapping("/{videoId}")
    public ResponseEntity<ApiResponse<VideoSummaryResponse>> updateVideo(
            @PathVariable Long videoId,
            @Valid @RequestBody VideoUpdateRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {

        if (userRole == null || UPLOAD_ROLES.stream().noneMatch(r -> userRole.toUpperCase().contains(r))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Access denied: only teachers and admins can edit videos"));
        }

        Long userId = parseUserId(userIdHeader);
        VideoSummaryResponse response = storageService.updateVideo(videoId, request, userId, userRole);
        return ResponseEntity.ok(ApiResponse.ok(response, "Video updated successfully"));
    }

    /**
     * Delete video and purge physical storage in MinIO.
     */
    @DeleteMapping("/{videoId}")
    public ResponseEntity<ApiResponse<Void>> deleteVideo(
            @PathVariable Long videoId,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {

        if (userRole == null || UPLOAD_ROLES.stream().noneMatch(r -> userRole.toUpperCase().contains(r))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Access denied: only teachers and admins can delete videos"));
        }

        Long userId = parseUserId(userIdHeader);
        storageService.deleteVideo(videoId, userId, userRole);
        return ResponseEntity.ok(ApiResponse.ok(null, "Video deleted successfully"));
    }

    // ========================================================================
    //  STUDENT COMMENTS & QUESTIONS
    // ========================================================================

    /**
     * Submit student question/comment on a video.
     */
    @PostMapping("/{videoId}/comments")
    public ResponseEntity<ApiResponse<VideoCommentResponse>> addComment(
            @PathVariable Long videoId,
            @Valid @RequestBody CreateCommentRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestHeader(value = "X-User-Name", required = false) String userName,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {

        Long userId = parseUserId(userIdHeader);
        if (userId == 0L) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authentication required to post comments"));
        }

        VideoCommentResponse response = storageService.addComment(
                videoId, request.getComment(), userId, userName, userRole != null ? userRole : "STUDENT");
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(response, "Comment posted successfully"));
    }

    /**
     * List all comments for a video.
     */
    @GetMapping("/{videoId}/comments")
    public ResponseEntity<ApiResponse<List<VideoCommentResponse>>> getVideoComments(
            @PathVariable Long videoId) {
        return ResponseEntity.ok(ApiResponse.ok(storageService.getVideoComments(videoId)));
    }

    /**
     * Teacher inbox: view questions/comments on teacher's videos.
     */
    @GetMapping("/comments/teacher")
    public ResponseEntity<ApiResponse<List<VideoCommentResponse>>> getTeacherComments(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {

        if (userRole == null || UPLOAD_ROLES.stream().noneMatch(r -> userRole.toUpperCase().contains(r))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Access denied: only teachers and admins can access comments inbox"));
        }

        Long userId = parseUserId(userIdHeader);
        return ResponseEntity.ok(ApiResponse.ok(storageService.getTeacherComments(userId, userRole)));
    }

    /**
     * Mark a comment as read.
     */
    @PutMapping("/comments/{commentId}/read")
    public ResponseEntity<ApiResponse<VideoCommentResponse>> markCommentRead(
            @PathVariable Long commentId,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {

        Long userId = parseUserId(userIdHeader);
        return ResponseEntity.ok(ApiResponse.ok(storageService.markCommentRead(commentId, userId, userRole)));
    }

    /**
     * Mark a comment as resolved.
     */
    @PutMapping("/comments/{commentId}/resolve")
    public ResponseEntity<ApiResponse<VideoCommentResponse>> markCommentResolved(
            @PathVariable Long commentId,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {

        Long userId = parseUserId(userIdHeader);
        return ResponseEntity.ok(ApiResponse.ok(storageService.markCommentResolved(commentId, userId, userRole)));
    }

    /**
     * Reply to a student question/doubt.
     */
    @PostMapping("/comments/{commentId}/reply")
    public ResponseEntity<ApiResponse<VideoCommentResponse>> replyToComment(
            @PathVariable Long commentId,
            @RequestBody ReplyCommentRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestHeader(value = "X-User-Name", required = false) String userName,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {

        Long userId = parseUserId(userIdHeader);
        if (userId == 0L) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authentication required to reply"));
        }

        String effectiveReply = request != null ? request.getEffectiveReply() : "";
        VideoCommentResponse response = storageService.replyToComment(
                commentId, effectiveReply, userId, userName != null ? userName : "Teacher", userRole);
        return ResponseEntity.ok(ApiResponse.ok(response, "Reply posted successfully"));
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
    //  VIDEO DOWNLOAD
    // ========================================================================

    /**
     * Download the real video file attachment directly from MinIO.
     * Optionally accepts quality parameter (e.g. 1080p, 720p, 480p, 360p, 240p).
     */
    @GetMapping("/{videoId}/download")
    public ResponseEntity<InputStreamResource> downloadVideo(
            @PathVariable Long videoId,
            @RequestParam(value = "quality", required = false) String quality) {
        return storageService.downloadVideo(videoId, quality);
    }

    // ========================================================================
    //  QUERY BY MODULE / CHAPTER
    // ========================================================================

    /**
     * Get all active videos in a module/chapter.
     */
    @GetMapping("/by-module/{moduleId}")
    public ResponseEntity<ApiResponse<List<VideoSummaryResponse>>> getVideosByModule(
            @PathVariable Long moduleId) {
        return ResponseEntity.ok(ApiResponse.ok(storageService.getVideosByModule(moduleId)));
    }

    /**
     * Get all active videos matching syllabus classGrade, subject, and chapter.
     */
    @GetMapping("/by-chapter")
    public ResponseEntity<ApiResponse<List<VideoSummaryResponse>>> getVideosByChapter(
            @RequestParam("classGrade") Integer classGrade,
            @RequestParam("subject") String subject,
            @RequestParam("chapter") String chapter) {
        return ResponseEntity.ok(ApiResponse.ok(storageService.getVideosByChapter(classGrade, subject, chapter)));
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

    @GetMapping("/{videoId}")
    public ResponseEntity<ApiResponse<VideoDetailResponse>> getVideoDetail(@PathVariable Long videoId) {
        return ResponseEntity.ok(ApiResponse.ok(videoService.getVideoDetail(videoId)));
    }

    @GetMapping("/{videoId}/summary")
    public ResponseEntity<ApiResponse<VideoSummaryResponse>> getVideoSummary(@PathVariable Long videoId) {
        return ResponseEntity.ok(ApiResponse.ok(videoService.getVideoById(videoId)));
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
