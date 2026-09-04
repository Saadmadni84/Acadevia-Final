package com.acadevia.content.service;

import com.acadevia.content.dto.request.VideoUpdateRequest;
import com.acadevia.content.dto.response.VideoCommentResponse;
import com.acadevia.content.dto.response.VideoPlayUrlResponse;
import com.acadevia.content.dto.response.VideoSummaryResponse;
import com.acadevia.content.dto.response.VideoUploadResponse;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Object storage and video content management operations.
 * Abstracts the S3/MinIO layer and database lifecycle from the controller.
 */
public interface StorageService {

    /**
     * Upload a video file to MinIO and persist metadata in MySQL.
     */
    VideoUploadResponse uploadVideo(MultipartFile file, Long courseId, Long lessonId, String title, Long userId);

    /**
     * Upload a video file to MinIO with full academic curriculum context and description.
     */
    VideoUploadResponse uploadVideo(MultipartFile file, Long courseId, Long moduleId, Long lessonId,
                                   Integer classGrade, String subject, String chapter,
                                   String title, String description, Long userId);

    /**
     * Generate a short-lived presigned URL for direct browser playback.
     */
    VideoPlayUrlResponse getPlayUrl(Long videoId);

    /**
     * Stream video content through the backend with HTTP Range support.
     */
    ResponseEntity<InputStreamResource> streamVideo(Long videoId, String rangeHeader);

    /**
     * Download the real video object as an attachment from MinIO.
     */
    ResponseEntity<InputStreamResource> downloadVideo(Long videoId);

    /**
     * Download the video object for a specific quality if available, or original.
     */
    ResponseEntity<InputStreamResource> downloadVideo(Long videoId, String quality);

    /**
     * Get active videos for a given module/chapter ID.
     */
    List<VideoSummaryResponse> getVideosByModule(Long moduleId);

    /**
     * Get active videos by academic syllabus (classGrade, subject, chapter).
     */
    List<VideoSummaryResponse> getVideosByChapter(Integer classGrade, String subject, String chapter);

    /**
     * Get videos created/instructed by the authenticated user (or all if admin).
     */
    List<VideoSummaryResponse> getVideosByInstructor(Long instructorId, String role);

    /**
     * Update video metadata (title, description, syllabus) with ownership validation.
     */
    VideoSummaryResponse updateVideo(Long videoId, VideoUpdateRequest request, Long userId, String role);

    /**
     * Safely delete video from MySQL and private MinIO with ownership validation.
     */
    void deleteVideo(Long videoId, Long userId, String role);

    /**
     * Delete the video object from MinIO storage.
     */
    void deleteVideoObject(String objectKey, String bucket);

    /**
     * Add student question/comment to a video.
     */
    VideoCommentResponse addComment(Long videoId, String commentText, Long userId, String userName, String userRole);

    /**
     * Get all comments for a video.
     */
    List<VideoCommentResponse> getVideoComments(Long videoId);

    /**
     * Get all comments for videos owned by a teacher (or all for admin).
     */
    List<VideoCommentResponse> getTeacherComments(Long teacherId, String role);

    /**
     * Mark a comment as read.
     */
    VideoCommentResponse markCommentRead(Long commentId, Long teacherId, String role);

    /**
     * Mark a comment as resolved.
     */
    VideoCommentResponse markCommentResolved(Long commentId, Long teacherId, String role);

    /**
     * Reply to a student comment/doubt.
     */
    VideoCommentResponse replyToComment(Long commentId, String replyText, Long userId, String userName, String role);
}
