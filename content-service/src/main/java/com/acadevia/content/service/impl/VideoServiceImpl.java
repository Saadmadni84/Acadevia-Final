package com.acadevia.content.service.impl;

import com.acadevia.content.dto.request.VideoCreateRequest;
import com.acadevia.content.dto.request.VideoUpdateRequest;
import com.acadevia.content.dto.response.*;
import com.acadevia.content.entity.Video;
import com.acadevia.content.entity.enums.VideoQuality;
import com.acadevia.content.exception.ResourceNotFoundException;
import com.acadevia.content.mapper.VideoMapper;
import com.acadevia.content.mapper.SubtitleMapper;
import com.acadevia.content.repository.*;
import com.acadevia.content.service.VideoService;
import com.acadevia.content.util.VideoUtils;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VideoServiceImpl implements VideoService {

    private static final Logger log = LoggerFactory.getLogger(VideoServiceImpl.class);

    private final VideoRepository videoRepository;
    private final VideoSubtitleRepository subtitleRepository;
    private final VideoPopQuestionRepository popQuestionRepository;
    private final VideoWatchProgressRepository watchProgressRepository;
    private final VideoMapper videoMapper;
    private final SubtitleMapper subtitleMapper;

    @Override
    @Transactional
    @CacheEvict(value = {"videos", "lessonContent", "courseContent"}, allEntries = true)
    public VideoResponse createVideo(VideoCreateRequest request) {
        log.info("Creating video for lesson: {}", request.getLessonId());
        Video video = videoMapper.toEntity(request);
        Video saved = videoRepository.save(video);
        log.info("Video created with id: {}", saved.getId());
        return videoMapper.toResponse(saved);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"videos", "videoDetails", "lessonContent", "courseContent"}, allEntries = true)
    public VideoResponse updateVideo(Long videoId, VideoUpdateRequest request) {
        Video video = findVideoById(videoId);

        if (request.getTitle() != null) video.setTitle(request.getTitle());
        if (request.getDescription() != null) video.setDescription(request.getDescription());
        if (request.getSummary() != null) video.setSummary(request.getSummary());
        if (request.getSummaryPoints() != null) video.setSummaryPoints(request.getSummaryPoints());
        if (request.getKeyFormulas() != null) video.setKeyFormulas(request.getKeyFormulas());
        if (request.getKeyDefinitions() != null) video.setKeyDefinitions(request.getKeyDefinitions());
        if (request.getLanguageCode() != null) video.setLanguageCode(request.getLanguageCode());
        if (request.getUrl144p() != null) video.setUrl144p(request.getUrl144p());
        if (request.getUrl240p() != null) video.setUrl240p(request.getUrl240p());
        if (request.getUrl360p() != null) video.setUrl360p(request.getUrl360p());
        if (request.getUrl480p() != null) video.setUrl480p(request.getUrl480p());
        if (request.getUrl720p() != null) video.setUrl720p(request.getUrl720p());
        if (request.getUrl1080p() != null) video.setUrl1080p(request.getUrl1080p());
        if (request.getSize144pMb() != null) video.setSize144pMb(request.getSize144pMb());
        if (request.getSize240pMb() != null) video.setSize240pMb(request.getSize240pMb());
        if (request.getSize360pMb() != null) video.setSize360pMb(request.getSize360pMb());
        if (request.getSize480pMb() != null) video.setSize480pMb(request.getSize480pMb());
        if (request.getSize720pMb() != null) video.setSize720pMb(request.getSize720pMb());
        if (request.getSize1080pMb() != null) video.setSize1080pMb(request.getSize1080pMb());
        if (request.getDurationSeconds() != null) video.setDurationSeconds(request.getDurationSeconds());
        if (request.getThumbnailUrl() != null) video.setThumbnailUrl(request.getThumbnailUrl());
        if (request.getPosterUrl() != null) video.setPosterUrl(request.getPosterUrl());
        if (request.getTranscriptUrl() != null) video.setTranscriptUrl(request.getTranscriptUrl());
        if (request.getIsDownloadable() != null) video.setIsDownloadable(request.getIsDownloadable());
        if (request.getAllowSpeedControl() != null) video.setAllowSpeedControl(request.getAllowSpeedControl());
        if (request.getMinQuality() != null) video.setMinQuality(VideoUtils.parseQuality(request.getMinQuality()));
        if (request.getDefaultQuality() != null) video.setDefaultQuality(VideoUtils.parseQuality(request.getDefaultQuality()));
        if (request.getIsActive() != null) video.setIsActive(request.getIsActive());
        if (request.getChapterMarkers() != null) {
            video.setChapterMarkers(request.getChapterMarkers().stream()
                    .map(m -> new com.acadevia.content.entity.ChapterMarker(m.getTimestamp(), m.getTitle()))
                    .collect(Collectors.toList()));
        }

        Video updated = videoRepository.save(video);
        return videoMapper.toResponse(updated);
    }

    @Override
    @Cacheable(value = "videoDetails", key = "#videoId")
    public VideoSummaryResponse getVideoById(Long videoId) {
        Video video = videoRepository.findByIdAndIsActiveTrue(videoId)
                .orElseThrow(() -> new ResourceNotFoundException("Video", "id", videoId));
        return videoMapper.toSummaryResponse(video);
    }

    @Override
    @Cacheable(value = "videoDetails", key = "'detail:' + #videoId")
    public VideoDetailResponse getVideoDetail(Long videoId) {
        Video video = findVideoById(videoId);
        VideoDetailResponse response = videoMapper.toDetailResponse(video);
        response.setSubtitles(subtitleMapper.toResponseList(subtitleRepository.findByVideoIdAndIsActiveTrue(videoId)));
        return response;
    }

    @Override
    public VideoDetailResponse getVideoByIdWithProgress(Long videoId, Long userId) {
        VideoDetailResponse response = getVideoDetail(videoId);
        watchProgressRepository.findByVideoIdAndUserId(videoId, userId)
                .ifPresent(wp -> {
                    WatchProgressResponse progressResponse = WatchProgressResponse.builder()
                            .id(wp.getId())
                            .videoId(wp.getVideoId())
                            .userId(wp.getUserId())
                            .lastPositionSec(wp.getLastPositionSec())
                            .totalWatchedSec(wp.getTotalWatchedSec())
                            .watchPercentage(wp.getWatchPercentage())
                            .isCompleted(wp.getIsCompleted())
                            .lastPlaybackSpeed(wp.getLastPlaybackSpeed())
                            .lastQuality(wp.getLastQuality())
                            .rewatchCount(wp.getRewatchCount())
                            .sessionCount(wp.getSessionCount())
                            .firstWatchedAt(wp.getFirstWatchedAt())
                            .lastWatchedAt(wp.getLastWatchedAt())
                            .completedAt(wp.getCompletedAt())
                            .build();
                    response.setUserProgress(progressResponse);
                });
        return response;
    }

    @Override
    @Cacheable(value = "lessonContent", key = "'videos:lesson:' + #lessonId")
    public List<VideoSummaryResponse> getVideosByLessonId(Long lessonId) {
        return videoMapper.toSummaryResponseList(videoRepository.findByLessonIdAndIsActiveTrue(lessonId));
    }

    @Override
    public List<VideoSummaryResponse> getVideosByCourseId(Long courseId) {
        return videoMapper.toSummaryResponseList(videoRepository.findByCourseIdAndIsActiveTrue(courseId));
    }

    @Override
    public List<VideoSummaryResponse> getVideosByModuleId(Long moduleId) {
        return videoMapper.toSummaryResponseList(videoRepository.findByModuleIdAndIsActiveTrue(moduleId));
    }

    @Override
    public PageResponse<VideoSummaryResponse> getAllVideos(int pageNo, int pageSize, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(pageNo, pageSize, sort);
        Page<Video> page = videoRepository.findByIsActiveTrue(pageable);
        return buildPageResponse(page);
    }

    @Override
    public PageResponse<VideoSummaryResponse> getVideosByCreator(Long createdBy, int pageNo, int pageSize) {
        Pageable pageable = PageRequest.of(pageNo, pageSize, Sort.by("createdAt").descending());
        Page<Video> page = videoRepository.findByCreatedByAndIsActiveTrue(createdBy, pageable);
        return buildPageResponse(page);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"videos", "videoDetails", "lessonContent", "courseContent"}, allEntries = true)
    public void deleteVideo(Long videoId) {
        Video video = findVideoById(videoId);
        video.setIsActive(false);
        videoRepository.save(video);
        log.info("Video soft-deleted: {}", videoId);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"videos", "videoDetails", "lessonContent", "courseContent"}, allEntries = true)
    public void activateVideo(Long videoId) {
        Video video = findVideoById(videoId);
        video.setIsActive(true);
        videoRepository.save(video);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"videos", "videoDetails", "lessonContent", "courseContent"}, allEntries = true)
    public void deactivateVideo(Long videoId) {
        Video video = findVideoById(videoId);
        video.setIsActive(false);
        videoRepository.save(video);
    }

    @Override
    public VideoStatsResponse getVideoStats(Long videoId) {
        Video video = findVideoById(videoId);
        Long totalQuestions = popQuestionRepository.countByVideoIdAndIsActiveTrue(videoId);
        Double avgWatchPct = watchProgressRepository.avgWatchPercentageByVideoId(videoId);

        return VideoStatsResponse.builder()
                .videoId(videoId)
                .totalViews(video.getTotalViews())
                .uniqueViewers(video.getUniqueViewers())
                .avgWatchPct(avgWatchPct != null ? avgWatchPct : 0.0)
                .totalWatchTimeSec(video.getTotalWatchTimeSec())
                .totalPopQuestions(totalQuestions != null ? totalQuestions.intValue() : 0)
                .avgPopAccuracy(video.getAvgPopAccuracy())
                .totalDownloads(video.getTotalDownloads())
                .totalBookmarks(video.getTotalBookmarks())
                .totalNotes(video.getTotalNotes())
                .likeCount(video.getLikeCount())
                .dislikeCount(video.getDislikeCount())
                .build();
    }

    @Override
    @Cacheable(value = "lessonContent", key = "'lesson:' + #lessonId")
    public LessonContentResponse getLessonContent(Long lessonId) {
        List<Video> videos = videoRepository.findByLessonIdAndIsActiveTrue(lessonId);
        Long totalDuration = videoRepository.sumDurationByLessonId(lessonId);
        Long videoCount = videoRepository.countByLessonId(lessonId);

        return LessonContentResponse.builder()
                .lessonId(lessonId)
                .videos(videoMapper.toSummaryResponseList(videos))
                .totalVideos(videoCount != null ? videoCount.intValue() : 0)
                .totalDurationSeconds(totalDuration != null ? totalDuration.intValue() : 0)
                .build();
    }

    @Override
    public LessonContentResponse getLessonContentWithProgress(Long lessonId, Long userId) {
        LessonContentResponse response = getLessonContent(lessonId);
        Double avgProgress = watchProgressRepository.avgWatchPercentageByLessonAndUser(lessonId, userId);
        response.setOverallWatchProgress(avgProgress != null ? avgProgress : 0.0);
        return response;
    }

    @Override
    @Cacheable(value = "courseContent", key = "'course:' + #courseId")
    public CourseContentResponse getCourseContent(Long courseId) {
        List<Video> videos = videoRepository.findByCourseIdOrderByModuleAndLesson(courseId);
        Long totalDuration = videoRepository.sumDurationByCourseId(courseId);
        Long videoCount = videoRepository.countByCourseId(courseId);

        var moduleVideos = videos.stream()
                .collect(Collectors.groupingBy(
                        Video::getModuleId,
                        Collectors.mapping(videoMapper::toSummaryResponse, Collectors.toList())
                ));

        return CourseContentResponse.builder()
                .courseId(courseId)
                .moduleVideos(moduleVideos)
                .totalVideos(videoCount != null ? videoCount.intValue() : 0)
                .totalDurationSeconds(totalDuration != null ? totalDuration.intValue() : 0)
                .build();
    }

    @Override
    public CourseContentResponse getCourseContentWithProgress(Long courseId, Long userId) {
        CourseContentResponse response = getCourseContent(courseId);
        Double avgProgress = watchProgressRepository.avgWatchPercentageByCourseAndUser(courseId, userId);
        response.setOverallWatchProgress(avgProgress != null ? avgProgress : 0.0);
        return response;
    }

    @Override
    public List<VideoResponse> getVideosByIds(List<Long> videoIds) {
        return videoMapper.toResponseList(videoRepository.findByIdIn(videoIds));
    }

    @Override
    @Transactional
    public void incrementViewCount(Long videoId) {
        videoRepository.incrementTotalViews(videoId);
    }

    @Override
    public PageResponse<VideoSummaryResponse> getVideosByLessonId(Long lessonId, int pageNo, int pageSize, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(pageNo, pageSize, sort);
        Page<Video> page = videoRepository.findByLessonIdAndIsActiveTrue(lessonId, pageable);
        return buildPageResponse(page);
    }

    @Override
    public PageResponse<VideoSummaryResponse> getVideosByCourseId(Long courseId, int pageNo, int pageSize, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(pageNo, pageSize, sort);
        Page<Video> page = videoRepository.findByCourseIdAndIsActiveTrue(courseId, pageable);
        return buildPageResponse(page);
    }

    @Override
    public PageResponse<VideoSummaryResponse> searchVideos(String keyword, int pageNo, int pageSize) {
        Pageable pageable = PageRequest.of(pageNo, pageSize, Sort.by("createdAt").descending());
        Page<Video> page = videoRepository.searchByKeyword(keyword, pageable);
        return buildPageResponse(page);
    }

    private Video findVideoById(Long videoId) {
        return videoRepository.findById(videoId)
                .orElseThrow(() -> new ResourceNotFoundException("Video", "id", videoId));
    }

    private PageResponse<VideoSummaryResponse> buildPageResponse(Page<Video> page) {
        List<VideoSummaryResponse> content = videoMapper.toSummaryResponseList(page.getContent());
        return PageResponse.<VideoSummaryResponse>builder()
                .content(content)
                .pageNo(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }
}
