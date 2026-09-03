package com.acadevia.content.service;

import com.acadevia.content.dto.response.VideoPlayUrlResponse;
import com.acadevia.content.dto.response.VideoUploadResponse;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

/**
 * Object storage operations for video content.
 * Abstracts the S3/MinIO layer from the controller.
 */
public interface StorageService {

    /**
     * Upload a video file to MinIO and persist metadata in MySQL.
     *
     * @param file       the uploaded multipart file
     * @param courseId    the owning course
     * @param lessonId   the owning lesson
     * @param title      human-readable video title
     * @param userId     the authenticated uploader's ID
     * @return upload response with video ID, object key, and initial play URL
     */
    VideoUploadResponse uploadVideo(MultipartFile file, Long courseId, Long lessonId, String title, Long userId);

    /**
     * Generate a short-lived presigned URL for direct browser playback.
     *
     * @param videoId the video ID
     * @return play URL response with presigned URL and expiration
     */
    VideoPlayUrlResponse getPlayUrl(Long videoId);

    /**
     * Stream video content through the backend with HTTP Range support.
     * Falls back when presigned URLs are not usable (e.g., CORS issues).
     *
     * @param videoId     the video ID
     * @param rangeHeader the HTTP Range header (e.g., "bytes=0-1023")
     * @return ResponseEntity with streaming body and appropriate status (200 or 206)
     */
    ResponseEntity<InputStreamResource> streamVideo(Long videoId, String rangeHeader);

    /**
     * Delete the video object from MinIO storage.
     *
     * @param objectKey the S3 object key
     * @param bucket    the bucket name
     */
    void deleteVideoObject(String objectKey, String bucket);
}
