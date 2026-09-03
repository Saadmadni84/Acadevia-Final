package com.acadevia.content.service.impl;

import com.acadevia.content.dto.response.VideoPlayUrlResponse;
import com.acadevia.content.dto.response.VideoUploadResponse;
import com.acadevia.content.entity.Video;
import com.acadevia.content.exception.VideoProcessingException;
import com.acadevia.content.repository.VideoRepository;
import com.acadevia.content.service.StorageService;
import com.amazonaws.HttpMethod;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URL;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.Set;
import java.util.UUID;

/**
 * MinIO-backed implementation of {@link StorageService}.
 *
 * Handles video upload to the acadevia-videos bucket, presigned URL generation
 * for private playback, and authenticated HTTP Range streaming.
 */
@Service
@Slf4j
public class MinioStorageServiceImpl implements StorageService {

    private static final Set<String> ALLOWED_VIDEO_TYPES = Set.of(
            "video/mp4", "video/webm", "video/quicktime", "video/x-matroska"
    );

    private static final long MAX_UPLOAD_BYTES = 500L * 1024 * 1024; // 500 MB

    private final AmazonS3 amazonS3;
    private final VideoRepository videoRepository;

    @Value("${acadevia.minio.bucket.videos:acadevia-videos}")
    private String videoBucket;

    @Value("${acadevia.minio.public-url:http://localhost:9000}")
    private String publicUrl;

    @Value("${spring.cloud.aws.endpoint:http://minio:9000}")
    private String internalEndpoint;

    @Value("${acadevia.minio.presigned-url-expiry-minutes:15}")
    private int presignedExpiryMinutes;

    public MinioStorageServiceImpl(AmazonS3 amazonS3, VideoRepository videoRepository) {
        this.amazonS3 = amazonS3;
        this.videoRepository = videoRepository;
    }

    // ========================================================================
    //  UPLOAD
    // ========================================================================

    @Override
    @Transactional
    public VideoUploadResponse uploadVideo(MultipartFile file, Long courseId, Long lessonId,
                                           String title, Long userId) {
        // 1. Validate
        validateUpload(file);

        String originalFilename = sanitizeFilename(file.getOriginalFilename());
        String contentType = file.getContentType() != null ? file.getContentType() : "video/mp4";
        String extension = getExtension(originalFilename);
        long fileSize = file.getSize();

        // 2. Generate safe object key
        String objectKey = String.format("videos/%d/%d/%s.%s",
                courseId, lessonId, UUID.randomUUID(), extension);

        // 3. Upload to MinIO (streaming — does not load entire file into heap)
        try (InputStream inputStream = file.getInputStream()) {
            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentType(contentType);
            metadata.setContentLength(fileSize);
            metadata.addUserMetadata("original-filename", originalFilename);
            metadata.addUserMetadata("uploaded-by", String.valueOf(userId));

            PutObjectRequest putRequest = new PutObjectRequest(
                    videoBucket, objectKey, inputStream, metadata);

            amazonS3.putObject(putRequest);
            log.info("Uploaded video to MinIO: bucket={}, key={}, size={} bytes", videoBucket, objectKey, fileSize);

        } catch (IOException e) {
            throw new VideoProcessingException("Failed to read uploaded file: " + e.getMessage());
        } catch (Exception e) {
            log.error("MinIO upload failed for key={}: {}", objectKey, e.getMessage(), e);
            throw new VideoProcessingException("Failed to upload video to storage: " + e.getMessage());
        }

        // 4. Persist video metadata in MySQL
        Video video;
        try {
            video = Video.builder()
                    .lessonId(lessonId)
                    .courseId(courseId)
                    .moduleId(0L)   // default; can be updated later
                    .title(title)
                    .objectKey(objectKey)
                    .bucket(videoBucket)
                    .originalFilename(originalFilename)
                    .contentType(contentType)
                    .fileSizeBytes(fileSize)
                    .durationSeconds(0)  // unknown until processing
                    .createdBy(userId)
                    .isActive(true)
                    .isProcessing(false)
                    .processingStatus("UPLOADED")
                    .build();

            video = videoRepository.save(video);
            log.info("Saved video metadata: id={}, objectKey={}", video.getId(), objectKey);

        } catch (Exception e) {
            // COMPENSATION: database failed → delete the orphaned MinIO object
            log.error("Database save failed after MinIO upload; compensating by deleting object: {}", objectKey, e);
            try {
                amazonS3.deleteObject(videoBucket, objectKey);
            } catch (Exception deleteEx) {
                log.error("Failed to compensate (delete orphan): {}", deleteEx.getMessage());
            }
            throw new VideoProcessingException("Failed to save video metadata: " + e.getMessage());
        }

        // 5. Build response
        String playUrl = generatePublicPresignedUrl(objectKey);

        return VideoUploadResponse.builder()
                .videoId(video.getId())
                .lessonId(lessonId)
                .courseId(courseId)
                .title(title)
                .objectKey(objectKey)
                .bucket(videoBucket)
                .originalFilename(originalFilename)
                .contentType(contentType)
                .fileSizeBytes(fileSize)
                .fileSizeMb(BigDecimal.valueOf(fileSize)
                        .divide(BigDecimal.valueOf(1024 * 1024), 2, RoundingMode.HALF_UP)
                        .doubleValue())
                .playUrl(playUrl)
                .createdAt(video.getCreatedAt())
                .build();
    }

    // ========================================================================
    //  PRESIGNED URL
    // ========================================================================

    @Override
    public VideoPlayUrlResponse getPlayUrl(Long videoId) {
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new VideoProcessingException("Video not found: " + videoId));

        if (video.getObjectKey() == null || video.getObjectKey().isBlank()) {
            throw new VideoProcessingException("Video has no stored object (legacy URL-only record)");
        }

        String presignedUrl = generatePublicPresignedUrl(video.getObjectKey());

        return VideoPlayUrlResponse.builder()
                .videoId(videoId)
                .title(video.getTitle())
                .presignedUrl(presignedUrl)
                .streamUrl("/api/v1/content/videos/" + videoId + "/stream")
                .expiresInSeconds(presignedExpiryMinutes * 60)
                .quality("original")
                .build();
    }

    // ========================================================================
    //  STREAMING (HTTP Range)
    // ========================================================================

    @Override
    public ResponseEntity<InputStreamResource> streamVideo(Long videoId, String rangeHeader) {
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new VideoProcessingException("Video not found: " + videoId));

        if (video.getObjectKey() == null || video.getObjectKey().isBlank()) {
            throw new VideoProcessingException("Video has no stored object");
        }

        String objectKey = video.getObjectKey();
        String bucket = video.getBucket() != null ? video.getBucket() : videoBucket;

        // Get object metadata to know total size
        ObjectMetadata objectMetadata = amazonS3.getObjectMetadata(bucket, objectKey);
        long contentLength = objectMetadata.getContentLength();
        String objectContentType = objectMetadata.getContentType();
        if (objectContentType == null) objectContentType = "video/mp4";

        if (rangeHeader != null && rangeHeader.startsWith("bytes=")) {
            // Parse range
            String rangeValue = rangeHeader.substring("bytes=".length());
            String[] parts = rangeValue.split("-");
            long start = Long.parseLong(parts[0]);
            long end = parts.length > 1 && !parts[1].isEmpty()
                    ? Long.parseLong(parts[1])
                    : contentLength - 1;

            if (end >= contentLength) end = contentLength - 1;
            long rangeLength = end - start + 1;

            GetObjectRequest getRequest = new GetObjectRequest(bucket, objectKey)
                    .withRange(start, end);
            S3Object s3Object = amazonS3.getObject(getRequest);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(objectContentType));
            headers.setContentLength(rangeLength);
            headers.set("Content-Range", String.format("bytes %d-%d/%d", start, end, contentLength));
            headers.set("Accept-Ranges", "bytes");

            return ResponseEntity.status(HttpStatus.PARTIAL_CONTENT)
                    .headers(headers)
                    .body(new InputStreamResource(s3Object.getObjectContent()));
        } else {
            // Full content
            S3Object s3Object = amazonS3.getObject(bucket, objectKey);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(objectContentType));
            headers.setContentLength(contentLength);
            headers.set("Accept-Ranges", "bytes");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(new InputStreamResource(s3Object.getObjectContent()));
        }
    }

    // ========================================================================
    //  DELETE
    // ========================================================================

    @Override
    public void deleteVideoObject(String objectKey, String bucket) {
        try {
            amazonS3.deleteObject(bucket != null ? bucket : videoBucket, objectKey);
            log.info("Deleted object from MinIO: bucket={}, key={}", bucket, objectKey);
        } catch (Exception e) {
            log.error("Failed to delete object from MinIO: key={}, error={}", objectKey, e.getMessage());
            throw new VideoProcessingException("Failed to delete video from storage: " + e.getMessage());
        }
    }

    // ========================================================================
    //  PRIVATE HELPERS
    // ========================================================================

    private void validateUpload(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new VideoProcessingException("No file provided or file is empty");
        }
        if (file.getSize() > MAX_UPLOAD_BYTES) {
            throw new VideoProcessingException(
                    String.format("File size %.1f MB exceeds maximum allowed %d MB",
                            file.getSize() / (1024.0 * 1024.0), MAX_UPLOAD_BYTES / (1024 * 1024)));
        }
        String mimeType = file.getContentType();
        if (mimeType == null || !ALLOWED_VIDEO_TYPES.contains(mimeType.toLowerCase())) {
            throw new VideoProcessingException(
                    "Unsupported video type: " + mimeType + ". Allowed: " + ALLOWED_VIDEO_TYPES);
        }
        String filename = file.getOriginalFilename();
        if (filename != null && (filename.contains("..") || filename.contains("/") || filename.contains("\\"))) {
            throw new VideoProcessingException("Invalid filename: path traversal detected");
        }
    }

    private String sanitizeFilename(String filename) {
        if (filename == null || filename.isBlank()) return "video.mp4";
        // Remove path components and suspicious characters
        filename = filename.replaceAll("[/\\\\:*?\"<>|]", "_");
        // Remove leading dots
        while (filename.startsWith(".")) filename = filename.substring(1);
        return filename.isBlank() ? "video.mp4" : filename;
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "mp4";
        String ext = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
        // Whitelist safe extensions
        return Set.of("mp4", "webm", "mov", "mkv").contains(ext) ? ext : "mp4";
    }

    /**
     * Generates a presigned URL replacing the internal MinIO endpoint with the
     * host-accessible public URL so the browser can reach it.
     */
    private String generatePublicPresignedUrl(String objectKey) {
        Date expiration = new Date(System.currentTimeMillis() + (long) presignedExpiryMinutes * 60 * 1000);
        GeneratePresignedUrlRequest request = new GeneratePresignedUrlRequest(videoBucket, objectKey)
                .withMethod(HttpMethod.GET)
                .withExpiration(expiration);

        URL url = amazonS3.generatePresignedUrl(request);
        String urlStr = url.toString();

        // Replace internal Docker endpoint with public URL
        if (!internalEndpoint.equals(publicUrl)) {
            urlStr = urlStr.replace(internalEndpoint, publicUrl);
        }

        return urlStr;
    }
}
