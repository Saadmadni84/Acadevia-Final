package com.acadevia.content.service.impl;

import com.acadevia.content.dto.event.VideoCompletedEvent;
import com.acadevia.content.dto.request.WatchProgressUpdateRequest;
import com.acadevia.content.dto.response.UserVideoProgressResponse;
import com.acadevia.content.dto.response.WatchProgressResponse;
import com.acadevia.content.entity.RewatchSection;
import com.acadevia.content.entity.Video;
import com.acadevia.content.entity.VideoWatchProgress;
import com.acadevia.content.exception.ResourceNotFoundException;
import com.acadevia.content.repository.VideoPopQuestionRepository;
import com.acadevia.content.repository.VideoPopResponseRepository;
import com.acadevia.content.repository.VideoRepository;
import com.acadevia.content.repository.VideoWatchProgressRepository;
import com.acadevia.content.service.WatchProgressService;
import com.acadevia.content.util.AppConstants;
import com.acadevia.content.util.VideoUtils;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WatchProgressServiceImpl implements WatchProgressService {

    private static final Logger log = LoggerFactory.getLogger(WatchProgressServiceImpl.class);

    private final VideoWatchProgressRepository progressRepository;
    private final VideoRepository videoRepository;
    private final VideoPopQuestionRepository popQuestionRepository;
    private final VideoPopResponseRepository popResponseRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    @Transactional
    public WatchProgressResponse updateWatchProgress(WatchProgressUpdateRequest request) {
        Video video = videoRepository.findById(request.getVideoId())
                .orElseThrow(() -> new ResourceNotFoundException("Video", "id", request.getVideoId()));

        VideoWatchProgress progress = progressRepository.findByVideoIdAndUserId(request.getVideoId(), request.getUserId())
                .orElse(VideoWatchProgress.builder()
                        .videoId(request.getVideoId())
                        .userId(request.getUserId())
                        .firstWatchedAt(LocalDateTime.now())
                        .sessionCount(0)
                        .totalWatchedSec(0)
                        .lastPositionSec(0)
                        .watchPercentage(0.0)
                        .isCompleted(false)
                        .rewatchCount(0)
                        .build());

        boolean isNewSession = progress.getId() == null;

        progress.setLastPositionSec(request.getLastPositionSec());
        progress.setTotalWatchedSec(request.getTotalWatchedSec());
        progress.setLastWatchedAt(LocalDateTime.now());

        if (request.getWatchPercentage() != null) {
            progress.setWatchPercentage(request.getWatchPercentage());
        } else {
            progress.setWatchPercentage(VideoUtils.calculateWatchPercentage(request.getTotalWatchedSec(), video.getDurationSeconds()));
        }

        if (request.getLastPlaybackSpeed() != null) progress.setLastPlaybackSpeed(request.getLastPlaybackSpeed());
        if (request.getLastQuality() != null) progress.setLastQuality(request.getLastQuality());
        if (request.getRewatchCount() != null) progress.setRewatchCount(request.getRewatchCount());

        if (request.getRewatchSections() != null) {
            progress.setRewatchSections(request.getRewatchSections().stream()
                    .map(s -> new RewatchSection(s.getStart(), s.getEnd()))
                    .collect(Collectors.toList()));
        }

        if (isNewSession) {
            progress.setSessionCount(1);
            if (!progressRepository.existsByVideoIdAndUserId(request.getVideoId(), request.getUserId())) {
                videoRepository.incrementUniqueViewers(request.getVideoId());
            }
        } else {
            progress.setSessionCount(progress.getSessionCount() + 1);
        }

        videoRepository.incrementTotalViews(request.getVideoId());

        boolean wasCompleted = Boolean.TRUE.equals(progress.getIsCompleted());
        if (!wasCompleted && VideoUtils.isVideoCompleted(progress.getWatchPercentage())) {
            progress.setIsCompleted(true);
            progress.setCompletedAt(LocalDateTime.now());
            publishVideoCompletedEvent(video, progress);
        }

        if (Boolean.TRUE.equals(request.getIsCompleted()) && !wasCompleted) {
            progress.setIsCompleted(true);
            progress.setCompletedAt(LocalDateTime.now());
            publishVideoCompletedEvent(video, progress);
        }

        VideoWatchProgress saved = progressRepository.save(progress);
        return mapToResponse(saved);
    }

    @Override
    public WatchProgressResponse getWatchProgress(Long videoId, Long userId) {
        VideoWatchProgress progress = progressRepository.findByVideoIdAndUserId(videoId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("WatchProgress", "videoId:userId", videoId + ":" + userId));
        return mapToResponse(progress);
    }

    @Override
    public List<WatchProgressResponse> getUserWatchHistory(Long userId) {
        return progressRepository.findByUserIdOrderByLastWatchedAtDesc(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<WatchProgressResponse> getCompletedVideos(Long userId) {
        return progressRepository.findCompletedByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<WatchProgressResponse> getInProgressVideos(Long userId) {
        return progressRepository.findInProgressByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public UserVideoProgressResponse getUserVideoProgress(Long videoId, Long userId) {
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new ResourceNotFoundException("Video", "id", videoId));

        WatchProgressResponse watchProgress = null;
        try {
            watchProgress = getWatchProgress(videoId, userId);
        } catch (ResourceNotFoundException ignored) {
        }

        Long totalQuestions = popQuestionRepository.countByVideoIdAndIsActiveTrue(videoId);
        Integer answered = popResponseRepository.countDistinctQuestionsAnsweredByVideoIdAndUserId(videoId, userId);
        Integer correct = popResponseRepository.countCorrectByVideoIdAndUserId(videoId, userId);
        Integer xpEarned = popResponseRepository.sumXpEarnedByVideoIdAndUserId(videoId, userId);

        return UserVideoProgressResponse.builder()
                .videoId(videoId)
                .videoTitle(video.getTitle())
                .durationSeconds(video.getDurationSeconds())
                .watchProgress(watchProgress)
                .popQuestionProgress(UserVideoProgressResponse.PopQuestionProgressSummary.builder()
                        .totalQuestions(totalQuestions != null ? totalQuestions.intValue() : 0)
                        .answeredQuestions(answered != null ? answered : 0)
                        .correctAnswers(correct != null ? correct : 0)
                        .accuracyRate(answered != null && answered > 0 ? (correct * 100.0 / answered) : 0.0)
                        .totalXpEarned(xpEarned != null ? xpEarned : 0)
                        .build())
                .build();
    }

    @Override
    public Double getCourseWatchProgress(Long courseId, Long userId) {
        Double avg = progressRepository.avgWatchPercentageByCourseAndUser(courseId, userId);
        return avg != null ? avg : 0.0;
    }

    @Override
    public Double getLessonWatchProgress(Long lessonId, Long userId) {
        Double avg = progressRepository.avgWatchPercentageByLessonAndUser(lessonId, userId);
        return avg != null ? avg : 0.0;
    }

    private void publishVideoCompletedEvent(Video video, VideoWatchProgress progress) {
        try {
            VideoCompletedEvent event = VideoCompletedEvent.builder()
                    .videoId(video.getId())
                    .userId(progress.getUserId())
                    .lessonId(video.getLessonId())
                    .courseId(video.getCourseId())
                    .moduleId(video.getModuleId())
                    .durationSeconds(video.getDurationSeconds())
                    .totalWatchedSec(progress.getTotalWatchedSec())
                    .watchPercentage(progress.getWatchPercentage())
                    .sessionCount(progress.getSessionCount())
                    .completedAt(progress.getCompletedAt())
                    .eventType("VIDEO_COMPLETED")
                    .build();
            kafkaTemplate.send(AppConstants.TOPIC_VIDEO_COMPLETED, String.valueOf(video.getId()), event);
            log.info("Video completed event sent: videoId={}, userId={}", video.getId(), progress.getUserId());
        } catch (Exception e) {
            log.warn("Failed to send video completed event: {}", e.getMessage());
        }
    }

    private WatchProgressResponse mapToResponse(VideoWatchProgress progress) {
        List<WatchProgressResponse.RewatchSectionResponse> sections = null;
        if (progress.getRewatchSections() != null) {
            sections = progress.getRewatchSections().stream()
                    .map(s -> WatchProgressResponse.RewatchSectionResponse.builder()
                            .start(s.getStart())
                            .end(s.getEnd())
                            .build())
                    .collect(Collectors.toList());
        }

        return WatchProgressResponse.builder()
                .id(progress.getId())
                .videoId(progress.getVideoId())
                .userId(progress.getUserId())
                .lastPositionSec(progress.getLastPositionSec())
                .totalWatchedSec(progress.getTotalWatchedSec())
                .watchPercentage(progress.getWatchPercentage())
                .isCompleted(progress.getIsCompleted())
                .lastPlaybackSpeed(progress.getLastPlaybackSpeed())
                .lastQuality(progress.getLastQuality())
                .rewatchCount(progress.getRewatchCount())
                .rewatchSections(sections)
                .sessionCount(progress.getSessionCount())
                .firstWatchedAt(progress.getFirstWatchedAt())
                .lastWatchedAt(progress.getLastWatchedAt())
                .completedAt(progress.getCompletedAt())
                .build();
    }
}
