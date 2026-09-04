package com.acadevia.content.service.impl;

import com.acadevia.content.dto.request.VideoUpdateRequest;
import com.acadevia.content.dto.response.VideoCommentResponse;
import com.acadevia.content.dto.response.VideoPlayUrlResponse;
import com.acadevia.content.dto.response.VideoSummaryResponse;
import com.acadevia.content.dto.response.VideoUploadResponse;
import com.acadevia.content.entity.Video;
import com.acadevia.content.entity.VideoComment;
import com.acadevia.content.exception.VideoProcessingException;
import com.acadevia.content.repository.VideoCommentRepository;
import com.acadevia.content.repository.VideoRepository;
import com.acadevia.content.service.StorageService;
import com.amazonaws.HttpMethod;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
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
import java.util.*;

/**
 * MinIO-backed implementation of {@link StorageService}.
 *
 * Handles video upload to the acadevia-videos bucket, presigned URL generation
 * for private playback, authenticated HTTP Range streaming, content management, and student comments.
 */
@Service
@Slf4j
public class MinioStorageServiceImpl implements StorageService {

    private static final Set<String> ALLOWED_VIDEO_TYPES = Set.of(
            "video/mp4", "video/webm", "video/quicktime", "video/x-matroska"
    );

    private static final long MAX_UPLOAD_BYTES = 500L * 1024 * 1024; // 500 MB

    private final AmazonS3 amazonS3;
    private final AmazonS3 presignS3Client;
    private final VideoRepository videoRepository;
    private final VideoCommentRepository videoCommentRepository;

    @Value("${acadevia.minio.bucket.videos:acadevia-videos}")
    private String videoBucket;

    @Value("${acadevia.minio.public-url:http://localhost:9000}")
    private String publicUrl;

    @Value("${spring.cloud.aws.endpoint:http://minio:9000}")
    private String internalEndpoint;

    @Value("${acadevia.minio.presigned-url-expiry-minutes:15}")
    private int presignedExpiryMinutes;

    public MinioStorageServiceImpl(
            AmazonS3 amazonS3,
            @Qualifier("publicPresignS3Client") AmazonS3 presignS3Client,
            VideoRepository videoRepository,
            VideoCommentRepository videoCommentRepository) {
        this.amazonS3 = amazonS3;
        this.presignS3Client = presignS3Client;
        this.videoRepository = videoRepository;
        this.videoCommentRepository = videoCommentRepository;
    }

    // ========================================================================
    //  UPLOAD
    // ========================================================================

    @Override
    @Transactional
    public VideoUploadResponse uploadVideo(MultipartFile file, Long courseId, Long lessonId,
                                           String title, Long userId) {
        return uploadVideo(file, courseId, 0L, lessonId, null, null, null, title, null, userId);
    }

    @Override
    @Transactional
    public VideoUploadResponse uploadVideo(MultipartFile file, Long courseId, Long moduleId, Long lessonId,
                                           Integer classGrade, String subject, String chapter,
                                           String title, String description, Long userId) {
        // 1. Validate
        validateUpload(file);

        String originalFilename = sanitizeFilename(file.getOriginalFilename());
        String contentType = file.getContentType() != null ? file.getContentType() : "video/mp4";
        String extension = getExtension(originalFilename);
        long fileSize = file.getSize();

        // 2. Generate safe object key
        String objectKey = String.format("videos/%d/%d/%s.%s",
                courseId != null ? courseId : 0L,
                lessonId != null ? lessonId : 0L,
                UUID.randomUUID(),
                extension);

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
                    .courseId(courseId != null ? courseId : 0L)
                    .moduleId(moduleId != null ? moduleId : 0L)
                    .classGrade(classGrade)
                    .subject(subject)
                    .chapter(chapter)
                    .title(title)
                    .description(description)
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
            log.info("Saved video metadata: id={}, objectKey={}, classGrade={}, subject={}, chapter={}, descLen={}",
                    video.getId(), objectKey, classGrade, subject, chapter, description != null ? description.length() : 0);

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

        // 5. Generate response
        String playUrl = generatePublicPresignedUrl(objectKey);

        return VideoUploadResponse.builder()
                .videoId(video.getId())
                .courseId(video.getCourseId())
                .moduleId(video.getModuleId())
                .lessonId(video.getLessonId())
                .classGrade(video.getClassGrade())
                .subject(video.getSubject())
                .chapter(video.getChapter())
                .title(video.getTitle())
                .objectKey(objectKey)
                .bucket(videoBucket)
                .originalFilename(originalFilename)
                .contentType(contentType)
                .fileSizeBytes(fileSize)
                .playUrl(playUrl)
                .downloadUrl("/api/v1/content/videos/" + video.getId() + "/download")
                .createdAt(LocalDateTime.now())
                .build();
    }

    // ========================================================================
    //  PLAYBACK (Presigned URL)
    // ========================================================================

    @Override
    public VideoPlayUrlResponse getPlayUrl(Long videoId) {
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new VideoProcessingException("Video not found: " + videoId));

        if (video.getObjectKey() == null || video.getObjectKey().isBlank()) {
            throw new VideoProcessingException("Video has no stored object");
        }

        String playUrl = generatePublicPresignedUrl(video.getObjectKey());

        return VideoPlayUrlResponse.builder()
                .videoId(video.getId())
                .title(video.getTitle())
                .presignedUrl(playUrl)
                .streamUrl("/api/v1/content/videos/" + video.getId() + "/stream")
                .expiresInSeconds(presignedExpiryMinutes * 60)
                .quality("original")
                .build();
    }

    // ========================================================================
    //  DOWNLOAD
    // ========================================================================

    @Override
    public ResponseEntity<InputStreamResource> downloadVideo(Long videoId) {
        return downloadVideo(videoId, null);
    }

    @Override
    public ResponseEntity<InputStreamResource> downloadVideo(Long videoId, String quality) {
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new VideoProcessingException("Video not found: " + videoId));

        String targetKey = null;

        if (quality != null && !quality.isBlank() && !quality.equalsIgnoreCase("original")) {
            String q = quality.toLowerCase().trim();
            if (q.equals("1080p")) {
                targetKey = video.getUrl1080p();
            } else if (q.equals("720p")) {
                targetKey = video.getUrl720p();
            } else if (q.equals("480p")) {
                targetKey = video.getUrl480p();
            } else if (q.equals("360p")) {
                targetKey = video.getUrl360p();
            } else if (q.equals("240p")) {
                targetKey = video.getUrl240p();
            } else if (q.equals("144p")) {
                targetKey = video.getUrl144p();
            }

            if (targetKey == null || targetKey.isBlank()) {
                targetKey = video.getObjectKey();
            }
        } else {
            targetKey = video.getObjectKey();
        }

        if (targetKey == null || targetKey.isBlank()) {
            throw new VideoProcessingException("Video has no stored object");
        }

        String bucket = video.getBucket() != null ? video.getBucket() : videoBucket;

        ObjectMetadata objectMetadata = amazonS3.getObjectMetadata(bucket, targetKey);
        long contentLength = objectMetadata.getContentLength();
        String objectContentType = objectMetadata.getContentType();
        if (objectContentType == null) objectContentType = "video/mp4";

        S3Object s3Object = amazonS3.getObject(bucket, targetKey);

        String baseFilename = video.getOriginalFilename() != null && !video.getOriginalFilename().isBlank()
                ? video.getOriginalFilename()
                : (video.getTitle() != null ? video.getTitle().replaceAll("[^a-zA-Z0-9.-]", "_") + ".mp4" : "video.mp4");

        String downloadFilename = baseFilename;
        if (quality != null && !quality.isBlank() && !quality.equalsIgnoreCase("original")) {
            int dotIdx = baseFilename.lastIndexOf('.');
            if (dotIdx > 0) {
                downloadFilename = baseFilename.substring(0, dotIdx) + "_" + quality.toLowerCase() + baseFilename.substring(dotIdx);
            } else {
                downloadFilename = baseFilename + "_" + quality.toLowerCase() + ".mp4";
            }
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(objectContentType));
        headers.setContentLength(contentLength);
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + downloadFilename + "\"");
        headers.set("Accept-Ranges", "bytes");

        return ResponseEntity.ok()
                .headers(headers)
                .body(new InputStreamResource(s3Object.getObjectContent()));
    }

    // ========================================================================
    //  QUERY BY MODULE / CHAPTER / INSTRUCTOR
    // ========================================================================

    @Override
    public List<VideoSummaryResponse> getVideosByModule(Long moduleId) {
        List<Video> videos = videoRepository.findByModuleIdAndIsActiveTrue(moduleId);
        return videos.stream().map(this::mapToSummary).toList();
    }

    @Override
    public List<VideoSummaryResponse> getVideosByChapter(
            Integer classGrade, String subject, String chapter) {
        List<Video> videos = videoRepository.findByClassGradeAndSubjectIgnoreCaseAndChapterIgnoreCaseAndIsActiveTrue(
                classGrade, subject, chapter);
        return videos.stream().map(this::mapToSummary).toList();
    }

    @Override
    public List<VideoSummaryResponse> getVideosByInstructor(Long instructorId, String role) {
        List<Video> videos;
        boolean isAdmin = role != null && role.toUpperCase().contains("ADMIN");
        if (isAdmin) {
            videos = videoRepository.findByIsActiveTrueOrderByCreatedAtDesc();
        } else {
            videos = videoRepository.findByCreatedByAndIsActiveTrueOrderByCreatedAtDesc(instructorId);
            if (videos.isEmpty()) {
                videos = videoRepository.findByIsActiveTrueOrderByCreatedAtDesc();
            }
        }
        return videos.stream().map(this::mapToSummary).toList();
    }

    // ========================================================================
    //  EDIT / DELETE VIDEO CONTENT
    // ========================================================================

    @Override
    @Transactional
    public VideoSummaryResponse updateVideo(Long videoId, VideoUpdateRequest request, Long userId, String role) {
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new VideoProcessingException("Video not found with id: " + videoId));

        boolean isPrivileged = role != null && (role.toUpperCase().contains("ADMIN") || role.toUpperCase().contains("TEACHER"));
        if (!isPrivileged && (video.getCreatedBy() == null || !video.getCreatedBy().equals(userId))) {
            throw new VideoProcessingException("You are not authorized to update this video");
        }

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            video.setTitle(request.getTitle().trim());
        }
        if (request.getDescription() != null) {
            video.setDescription(request.getDescription().trim());
        }
        if (request.getClassGrade() != null) {
            video.setClassGrade(request.getClassGrade());
        }
        if (request.getSubject() != null && !request.getSubject().isBlank()) {
            video.setSubject(request.getSubject().trim());
        }
        if (request.getChapter() != null && !request.getChapter().isBlank()) {
            video.setChapter(request.getChapter().trim());
        }
        if (request.getIsActive() != null) {
            video.setIsActive(request.getIsActive());
        }

        video = videoRepository.save(video);
        log.info("Updated video {}: title='{}', classGrade={}, subject='{}', chapter='{}'",
                videoId, video.getTitle(), video.getClassGrade(), video.getSubject(), video.getChapter());

        return mapToSummary(video);
    }

    @Override
    @Transactional
    public void deleteVideo(Long videoId, Long userId, String role) {
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new VideoProcessingException("Video not found with id: " + videoId));

        boolean isPrivileged = role != null && (role.toUpperCase().contains("ADMIN") || role.toUpperCase().contains("TEACHER"));
        if (!isPrivileged && (video.getCreatedBy() == null || !video.getCreatedBy().equals(userId))) {
            throw new VideoProcessingException("You are not authorized to delete this video");
        }

        String objectKey = video.getObjectKey();
        String bucket = video.getBucket() != null ? video.getBucket() : videoBucket;

        // 1. Delete associated comments safely
        try {
            videoCommentRepository.deleteByVideoId(videoId);
        } catch (Exception e) {
            log.warn("Error deleting comments for video {}: {}", videoId, e.getMessage());
        }

        // 2. Delete database record
        videoRepository.delete(video);
        log.info("Deleted video metadata from DB for id={}", videoId);

        // 3. Delete physical object from MinIO to prevent orphaned storage
        if (objectKey != null && !objectKey.isBlank()) {
            try {
                deleteVideoObject(objectKey, bucket);
                log.info("Permanently deleted video object from MinIO: bucket={}, key={}", bucket, objectKey);
            } catch (Exception e) {
                log.error("Failed to delete MinIO object for key={}: {}", objectKey, e.getMessage(), e);
            }
        }
    }

    // ========================================================================
    //  STUDENT COMMENTS & TEACHER INBOX
    // ========================================================================

    @Override
    @Transactional
    public VideoCommentResponse addComment(Long videoId, String commentText, Long userId, String userName, String userRole) {
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new VideoProcessingException("Video not found with id: " + videoId));

        if (commentText == null || commentText.isBlank()) {
            throw new VideoProcessingException("Comment text cannot be empty");
        }

        VideoComment comment = VideoComment.builder()
                .videoId(videoId)
                .userId(userId)
                .userName(userName != null ? userName : "Student")
                .userRole(userRole != null ? userRole : "STUDENT")
                .comment(commentText.trim())
                .isRead(false)
                .isResolved(false)
                .build();

        comment = videoCommentRepository.save(comment);

        // Update total comments on video
        int currentCount = video.getTotalComments() != null ? video.getTotalComments() : 0;
        video.setTotalComments(currentCount + 1);
        videoRepository.save(video);

        log.info("Student {} ({}) commented on video {}: {}", userName, userId, videoId, commentText);

        return mapToCommentResponse(comment, video);
    }

    @Override
    public List<VideoCommentResponse> getVideoComments(Long videoId) {
        Video video = videoRepository.findById(videoId).orElse(null);
        List<VideoComment> comments = videoCommentRepository.findByVideoIdOrderByCreatedAtDesc(videoId);
        return comments.stream().map(c -> mapToCommentResponse(c, video)).toList();
    }

    @Override
    public List<VideoCommentResponse> getTeacherComments(Long teacherId, String role) {
        List<VideoComment> comments;
        boolean isAdmin = role != null && role.toUpperCase().contains("ADMIN");
        if (isAdmin) {
            comments = videoCommentRepository.findAllCommentsOrderByCreatedAtDesc();
        } else {
            comments = videoCommentRepository.findCommentsForTeacher(teacherId);
            if (comments.isEmpty()) {
                comments = videoCommentRepository.findAllCommentsOrderByCreatedAtDesc();
            }
        }

        Map<Long, Video> videoMap = new HashMap<>();
        return comments.stream().map(c -> {
            Video v = videoMap.computeIfAbsent(c.getVideoId(), id -> videoRepository.findById(id).orElse(null));
            return mapToCommentResponse(c, v);
        }).toList();
    }

    @Override
    @Transactional
    public VideoCommentResponse markCommentRead(Long commentId, Long teacherId, String role) {
        VideoComment comment = videoCommentRepository.findById(commentId)
                .orElseThrow(() -> new VideoProcessingException("Comment not found with id: " + commentId));

        Video video = videoRepository.findById(comment.getVideoId()).orElse(null);
        boolean isPrivileged = role != null && (role.toUpperCase().contains("ADMIN") || role.toUpperCase().contains("TEACHER"));
        if (!isPrivileged && video != null && video.getCreatedBy() != null && !video.getCreatedBy().equals(teacherId)) {
            throw new VideoProcessingException("Not authorized to update this comment");
        }

        comment.setIsRead(true);
        comment = videoCommentRepository.save(comment);
        return mapToCommentResponse(comment, video);
    }

    @Override
    @Transactional
    public VideoCommentResponse markCommentResolved(Long commentId, Long teacherId, String role) {
        VideoComment comment = videoCommentRepository.findById(commentId)
                .orElseThrow(() -> new VideoProcessingException("Comment not found with id: " + commentId));

        Video video = videoRepository.findById(comment.getVideoId()).orElse(null);
        boolean isPrivileged = role != null && (role.toUpperCase().contains("ADMIN") || role.toUpperCase().contains("TEACHER"));
        if (!isPrivileged && video != null && video.getCreatedBy() != null && !video.getCreatedBy().equals(teacherId)) {
            throw new VideoProcessingException("Not authorized to resolve this comment");
        }

        comment.setIsResolved(true);
        comment.setIsRead(true);
        comment = videoCommentRepository.save(comment);
        return mapToCommentResponse(comment, video);
    }

    @Override
    @Transactional
    public VideoCommentResponse replyToComment(Long commentId, String replyText, Long userId, String userName, String role) {
        VideoComment comment = videoCommentRepository.findById(commentId)
                .orElseThrow(() -> new VideoProcessingException("Comment not found with id: " + commentId));

        if (replyText == null || replyText.isBlank()) {
            throw new VideoProcessingException("Reply text cannot be empty");
        }

        Video video = videoRepository.findById(comment.getVideoId()).orElse(null);
        comment.setReply(replyText.trim());
        comment.setRepliedByName(userName != null && !userName.isBlank() ? userName : "Teacher");
        comment.setRepliedAt(LocalDateTime.now());
        comment.setIsRead(true);
        comment.setIsResolved(true);
        comment = videoCommentRepository.save(comment);

        log.info("Teacher {} ({}) replied to comment {}: {}", userName, userId, commentId, replyText);
        return mapToCommentResponse(comment, video);
    }

    private VideoCommentResponse mapToCommentResponse(VideoComment comment, Video video) {
        return VideoCommentResponse.builder()
                .id(comment.getId())
                .videoId(comment.getVideoId())
                .videoTitle(video != null ? video.getTitle() : "Video Lesson")
                .classGrade(video != null ? video.getClassGrade() : null)
                .subject(video != null ? video.getSubject() : null)
                .chapter(video != null ? video.getChapter() : null)
                .userId(comment.getUserId())
                .userName(comment.getUserName())
                .userRole(comment.getUserRole())
                .comment(comment.getComment())
                .isRead(comment.getIsRead())
                .isResolved(comment.getIsResolved())
                .reply(comment.getReply())
                .repliedByName(comment.getRepliedByName())
                .repliedAt(comment.getRepliedAt())
                .parentId(comment.getParentId())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }

    private VideoSummaryResponse mapToSummary(Video video) {
        String playUrl = null;
        if (video.getObjectKey() != null && !video.getObjectKey().isBlank()) {
            try {
                playUrl = generatePublicPresignedUrl(video.getObjectKey());
            } catch (Exception e) {
                log.warn("Failed to generate play URL for video {}: {}", video.getId(), e.getMessage());
            }
        } else if (video.getUrl720p() != null) {
            playUrl = video.getUrl720p();
        }

        Double fileSizeMb = null;
        if (video.getFileSizeBytes() != null) {
            fileSizeMb = BigDecimal.valueOf(video.getFileSizeBytes())
                    .divide(BigDecimal.valueOf(1024 * 1024), 2, RoundingMode.HALF_UP)
                    .doubleValue();
        }

        List<com.acadevia.content.dto.response.VideoQualityOption> downloadOptions = new ArrayList<>();
        if (video.getUrl1080p() != null && !video.getUrl1080p().isBlank()) {
            downloadOptions.add(new com.acadevia.content.dto.response.VideoQualityOption(
                    "1080p", "1080p Full HD",
                    video.getSize1080pMb() != null ? video.getSize1080pMb().doubleValue() : null,
                    "/api/v1/content/videos/" + video.getId() + "/download?quality=1080p"));
        }
        if (video.getUrl720p() != null && !video.getUrl720p().isBlank()) {
            downloadOptions.add(new com.acadevia.content.dto.response.VideoQualityOption(
                    "720p", "720p HD",
                    video.getSize720pMb() != null ? video.getSize720pMb().doubleValue() : null,
                    "/api/v1/content/videos/" + video.getId() + "/download?quality=720p"));
        }
        if (video.getUrl480p() != null && !video.getUrl480p().isBlank()) {
            downloadOptions.add(new com.acadevia.content.dto.response.VideoQualityOption(
                    "480p", "480p SD",
                    video.getSize480pMb() != null ? video.getSize480pMb().doubleValue() : null,
                    "/api/v1/content/videos/" + video.getId() + "/download?quality=480p"));
        }
        if (video.getUrl360p() != null && !video.getUrl360p().isBlank()) {
            downloadOptions.add(new com.acadevia.content.dto.response.VideoQualityOption(
                    "360p", "360p Data Saver",
                    video.getSize360pMb() != null ? video.getSize360pMb().doubleValue() : null,
                    "/api/v1/content/videos/" + video.getId() + "/download?quality=360p"));
        }
        if (video.getUrl240p() != null && !video.getUrl240p().isBlank()) {
            downloadOptions.add(new com.acadevia.content.dto.response.VideoQualityOption(
                    "240p", "240p Low",
                    video.getSize240pMb() != null ? video.getSize240pMb().doubleValue() : null,
                    "/api/v1/content/videos/" + video.getId() + "/download?quality=240p"));
        }

        // When separate resolution files are not configured in DB, provide standard quality options from the video
        if (downloadOptions.isEmpty() && video.getObjectKey() != null && !video.getObjectKey().isBlank()) {
            double baseMb = fileSizeMb != null ? fileSizeMb : 150.0;
            double p720Mb = Math.round(baseMb * 10.0) / 10.0;
            double p480Mb = Math.round(baseMb * 0.55 * 10.0) / 10.0;
            double p360Mb = Math.round(baseMb * 0.32 * 10.0) / 10.0;

            downloadOptions.add(new com.acadevia.content.dto.response.VideoQualityOption(
                    "720p", "720p HD", p720Mb,
                    "/api/v1/content/videos/" + video.getId() + "/download?quality=720p"));
            downloadOptions.add(new com.acadevia.content.dto.response.VideoQualityOption(
                    "480p", "480p SD", p480Mb,
                    "/api/v1/content/videos/" + video.getId() + "/download?quality=480p"));
            downloadOptions.add(new com.acadevia.content.dto.response.VideoQualityOption(
                    "360p", "360p Data Saver", p360Mb,
                    "/api/v1/content/videos/" + video.getId() + "/download?quality=360p"));
            downloadOptions.add(new com.acadevia.content.dto.response.VideoQualityOption(
                    "original", "Original Quality", p720Mb,
                    "/api/v1/content/videos/" + video.getId() + "/download"));
        } else if (video.getObjectKey() != null && !video.getObjectKey().isBlank()) {
            downloadOptions.add(0, new com.acadevia.content.dto.response.VideoQualityOption(
                    "original", "Original Quality", fileSizeMb,
                    "/api/v1/content/videos/" + video.getId() + "/download"));
        }

        return VideoSummaryResponse.builder()
                .id(video.getId())
                .lessonId(video.getLessonId())
                .courseId(video.getCourseId())
                .moduleId(video.getModuleId())
                .classGrade(video.getClassGrade())
                .subject(video.getSubject())
                .chapter(video.getChapter())
                .title(video.getTitle())
                .description(video.getDescription())
                .createdBy(video.getCreatedBy())
                .totalComments(video.getTotalComments() != null ? video.getTotalComments() : 0)
                .originalFilename(video.getOriginalFilename())
                .contentType(video.getContentType())
                .fileSizeBytes(video.getFileSizeBytes())
                .fileSizeMb(fileSizeMb)
                .thumbnailUrl(video.getThumbnailUrl())
                .playUrl(playUrl)
                .downloadUrl("/api/v1/content/videos/" + video.getId() + "/download")
                .downloadOptions(downloadOptions)
                .durationSeconds(video.getDurationSeconds())
                .languageCode(video.getLanguageCode())
                .totalViews(video.getTotalViews() != null ? video.getTotalViews().intValue() : 0)
                .avgWatchPct(video.getAvgWatchPct())
                .totalPopQuestions(video.getTotalPopQuestions())
                .isActive(video.getIsActive())
                .isProcessing(video.getIsProcessing())
                .createdAt(video.getCreatedAt())
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

        String bucket = video.getBucket() != null ? video.getBucket() : videoBucket;
        String objectKey = video.getObjectKey();

        ObjectMetadata objectMetadata = amazonS3.getObjectMetadata(bucket, objectKey);
        long fileSize = objectMetadata.getContentLength();
        String contentType = objectMetadata.getContentType();
        if (contentType == null) contentType = "video/mp4";

        if (rangeHeader == null || !rangeHeader.startsWith("bytes=")) {
            S3Object s3Object = amazonS3.getObject(bucket, objectKey);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(contentType));
            headers.setContentLength(fileSize);
            headers.set("Accept-Ranges", "bytes");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(new InputStreamResource(s3Object.getObjectContent()));
        }

        long start = 0;
        long end = fileSize - 1;

        String[] ranges = rangeHeader.replace("bytes=", "").split("-");
        try {
            start = Long.parseLong(ranges[0]);
            if (ranges.length > 1 && !ranges[1].isBlank()) {
                end = Long.parseLong(ranges[1]);
            }
        } catch (NumberFormatException e) {
            log.warn("Malformed Range header: {}", rangeHeader);
        }

        if (start > end || start >= fileSize) {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Range", "bytes */" + fileSize);
            return ResponseEntity.status(HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE)
                    .headers(headers).build();
        }

        if (end >= fileSize) {
            end = fileSize - 1;
        }

        long contentLength = end - start + 1;

        GetObjectRequest rangeRequest = new GetObjectRequest(bucket, objectKey)
                .withRange(start, end);

        S3Object s3Object = amazonS3.getObject(rangeRequest);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(contentType));
        headers.setContentLength(contentLength);
        headers.set("Content-Range", String.format("bytes %d-%d/%d", start, end, fileSize));
        headers.set("Accept-Ranges", "bytes");

        return ResponseEntity.status(HttpStatus.PARTIAL_CONTENT)
                .headers(headers)
                .body(new InputStreamResource(s3Object.getObjectContent()));
    }

    // ========================================================================
    //  DELETE OBJECT FROM MINIO
    // ========================================================================

    @Override
    public void deleteVideoObject(String objectKey, String bucket) {
        String targetBucket = (bucket != null && !bucket.isBlank()) ? bucket : videoBucket;
        try {
            amazonS3.deleteObject(targetBucket, objectKey);
            log.info("Deleted object from MinIO: bucket={}, key={}", targetBucket, objectKey);
        } catch (Exception e) {
            log.error("Failed to delete object from MinIO: bucket={}, key={}: {}",
                    targetBucket, objectKey, e.getMessage(), e);
            throw new VideoProcessingException("Failed to delete object from storage: " + e.getMessage());
        }
    }

    // ========================================================================
    //  HELPERS
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
        filename = filename.replaceAll("[/\\\\:*?\"<>|]", "_");
        while (filename.startsWith(".")) filename = filename.substring(1);
        return filename.isBlank() ? "video.mp4" : filename;
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "mp4";
        String ext = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
        return Set.of("mp4", "webm", "mov", "mkv").contains(ext) ? ext : "mp4";
    }

    private String generatePublicPresignedUrl(String objectKey) {
        Date expiration = new Date(System.currentTimeMillis() + (long) presignedExpiryMinutes * 60 * 1000);
        GeneratePresignedUrlRequest request = new GeneratePresignedUrlRequest(videoBucket, objectKey)
                .withMethod(HttpMethod.GET)
                .withExpiration(expiration);

        URL url = presignS3Client.generatePresignedUrl(request);
        return url.toString();
    }
}
