package com.acadevia.content.service.impl;

import com.acadevia.content.dto.event.VideoDownloadedEvent;
import com.acadevia.content.dto.request.DownloadRequest;
import com.acadevia.content.dto.response.DownloadResponse;
import com.acadevia.content.dto.response.PageResponse;
import com.acadevia.content.entity.Video;
import com.acadevia.content.entity.VideoDownload;
import com.acadevia.content.entity.enums.DownloadStatus;
import com.acadevia.content.entity.enums.VideoQuality;
import com.acadevia.content.exception.*;
import com.acadevia.content.repository.VideoDownloadRepository;
import com.acadevia.content.repository.VideoRepository;
import com.acadevia.content.service.DownloadService;
import com.acadevia.content.util.AppConstants;
import com.acadevia.content.util.VideoUtils;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DownloadServiceImpl implements DownloadService {

    private static final Logger log = LoggerFactory.getLogger(DownloadServiceImpl.class);

    private final VideoDownloadRepository downloadRepository;
    private final VideoRepository videoRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    @Transactional
    public DownloadResponse requestDownload(DownloadRequest request) {
        Video video = videoRepository.findById(request.getVideoId())
                .orElseThrow(() -> new ResourceNotFoundException("Video", "id", request.getVideoId()));

        if (!Boolean.TRUE.equals(video.getIsDownloadable())) {
            throw new BadRequestException("This video is not available for download");
        }

        Long userDownloads = downloadRepository.countActiveDownloadsByUser(request.getUserId());
        if (userDownloads >= AppConstants.MAX_DOWNLOADS_PER_USER) {
            throw new DownloadLimitExceededException("Maximum downloads per user exceeded (" + AppConstants.MAX_DOWNLOADS_PER_USER + ")");
        }

        if (request.getDeviceId() != null) {
            Long deviceDownloads = downloadRepository.countActiveDownloadsByUserAndDevice(request.getUserId(), request.getDeviceId());
            if (deviceDownloads >= AppConstants.MAX_DOWNLOADS_PER_DEVICE) {
                throw new DownloadLimitExceededException("Maximum downloads per device exceeded (" + AppConstants.MAX_DOWNLOADS_PER_DEVICE + ")");
            }
        }

        VideoQuality quality = VideoUtils.parseQuality(request.getQuality());
        String downloadUrl = VideoUtils.getUrlForQuality(video, quality);
        BigDecimal fileSize = VideoUtils.getSizeForQuality(video, quality);

        if (downloadUrl == null || downloadUrl.isEmpty()) {
            throw new BadRequestException("Requested quality '" + request.getQuality() + "' is not available for this video");
        }

        String token = VideoUtils.generateDownloadToken();

        VideoDownload download = VideoDownload.builder()
                .videoId(request.getVideoId())
                .userId(request.getUserId())
                .lessonId(request.getLessonId())
                .courseId(request.getCourseId())
                .quality(quality)
                .fileSizeMb(fileSize != null ? fileSize : BigDecimal.ZERO)
                .downloadUrl(downloadUrl)
                .downloadStatus(DownloadStatus.QUEUED)
                .downloadToken(token)
                .tokenExpiresAt(LocalDateTime.now().plusHours(AppConstants.DOWNLOAD_TOKEN_EXPIRY_HOURS))
                .expiresAt(LocalDateTime.now().plusDays(AppConstants.DOWNLOAD_EXPIRY_DAYS))
                .requestedAt(LocalDateTime.now())
                .deviceId(request.getDeviceId())
                .build();

        VideoDownload saved = downloadRepository.save(download);
        videoRepository.incrementTotalDownloads(request.getVideoId());

        log.info("Download requested: id={}, videoId={}, userId={}, quality={}", saved.getId(), request.getVideoId(), request.getUserId(), quality);

        try {
            VideoDownloadedEvent event = VideoDownloadedEvent.builder()
                    .downloadId(saved.getId())
                    .videoId(request.getVideoId())
                    .userId(request.getUserId())
                    .lessonId(request.getLessonId())
                    .courseId(request.getCourseId())
                    .quality(quality.name())
                    .fileSizeMb(fileSize)
                    .deviceId(request.getDeviceId())
                    .platform(request.getPlatform())
                    .completedAt(LocalDateTime.now())
                    .eventType("VIDEO_DOWNLOAD_REQUESTED")
                    .build();
            kafkaTemplate.send(AppConstants.TOPIC_VIDEO_DOWNLOADED, String.valueOf(saved.getId()), event);
        } catch (Exception e) {
            log.warn("Failed to send download event: {}", e.getMessage());
        }

        return mapToResponse(saved);
    }

    @Override
    public DownloadResponse getDownloadById(Long downloadId) {
        return mapToResponse(findDownloadById(downloadId));
    }

    @Override
    public DownloadResponse getDownloadByToken(String token) {
        VideoDownload download = downloadRepository.findByDownloadToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Download", "token", token));

        if (download.getTokenExpiresAt() != null && download.getTokenExpiresAt().isBefore(LocalDateTime.now())) {
            throw new DownloadExpiredException("Download token has expired");
        }

        return mapToResponse(download);
    }

    @Override
    public PageResponse<DownloadResponse> getUserDownloads(Long userId, int pageNo, int pageSize) {
        Page<VideoDownload> page = downloadRepository.findByUserId(userId,
                PageRequest.of(pageNo, pageSize, Sort.by("requestedAt").descending()));

        List<DownloadResponse> content = page.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return PageResponse.<DownloadResponse>builder()
                .content(content)
                .pageNo(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    @Override
    public List<DownloadResponse> getActiveDownloads(Long userId) {
        return downloadRepository.findByUserIdAndDownloadStatus(userId, DownloadStatus.COMPLETED).stream()
                .filter(d -> d.getDeletedAt() == null)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void cancelDownload(Long downloadId) {
        VideoDownload download = findDownloadById(downloadId);
        download.setDownloadStatus(DownloadStatus.CANCELLED);
        downloadRepository.save(download);
    }

    @Override
    @Transactional
    public void deleteDownload(Long downloadId) {
        VideoDownload download = findDownloadById(downloadId);
        download.setDeletedAt(LocalDateTime.now());
        downloadRepository.save(download);
    }

    @Override
    @Transactional
    public void retryDownload(Long downloadId) {
        VideoDownload download = findDownloadById(downloadId);
        if (download.getRetryCount() >= download.getMaxRetries()) {
            throw new BadRequestException("Maximum retry attempts exceeded");
        }
        download.setDownloadStatus(DownloadStatus.QUEUED);
        download.setRetryCount(download.getRetryCount() + 1);
        download.setErrorMessage(null);
        downloadRepository.save(download);
    }

    @Override
    @Transactional
    @Scheduled(cron = "0 0 2 * * *")
    public void cleanupExpiredDownloads() {
        List<VideoDownload> expired = downloadRepository.findExpiredDownloads(LocalDateTime.now());
        expired.forEach(d -> {
            d.setDeletedAt(LocalDateTime.now());
            downloadRepository.save(d);
        });
        if (!expired.isEmpty()) {
            log.info("Cleaned up {} expired downloads", expired.size());
        }

        List<VideoDownload> expiredTokens = downloadRepository.findExpiredTokens(LocalDateTime.now());
        expiredTokens.forEach(d -> {
            d.setDownloadStatus(DownloadStatus.FAILED);
            d.setErrorMessage("Download token expired");
            downloadRepository.save(d);
        });
    }

    private VideoDownload findDownloadById(Long downloadId) {
        return downloadRepository.findById(downloadId)
                .orElseThrow(() -> new ResourceNotFoundException("Download", "id", downloadId));
    }

    private DownloadResponse mapToResponse(VideoDownload download) {
        return DownloadResponse.builder()
                .id(download.getId())
                .videoId(download.getVideoId())
                .userId(download.getUserId())
                .lessonId(download.getLessonId())
                .courseId(download.getCourseId())
                .quality(download.getQuality() != null ? download.getQuality().name() : null)
                .fileSizeMb(download.getFileSizeMb())
                .downloadUrl(download.getDownloadUrl())
                .downloadStatus(download.getDownloadStatus() != null ? download.getDownloadStatus().name() : null)
                .downloadProgressPct(download.getDownloadProgressPct())
                .errorMessage(download.getErrorMessage())
                .retryCount(download.getRetryCount())
                .maxRetries(download.getMaxRetries())
                .downloadToken(download.getDownloadToken())
                .tokenExpiresAt(download.getTokenExpiresAt())
                .expiresAt(download.getExpiresAt())
                .requestedAt(download.getRequestedAt())
                .startedAt(download.getStartedAt())
                .completedAt(download.getCompletedAt())
                .deviceId(download.getDeviceId())
                .build();
    }
}
