package com.acadevia.content.service;

import com.acadevia.content.dto.request.VideoCreateRequest;
import com.acadevia.content.dto.request.VideoUpdateRequest;
import com.acadevia.content.dto.response.*;

import java.util.List;

public interface VideoService {

    VideoResponse createVideo(VideoCreateRequest request);

    VideoResponse updateVideo(Long videoId, VideoUpdateRequest request);

    VideoSummaryResponse getVideoById(Long videoId);

    VideoDetailResponse getVideoDetail(Long videoId);

    VideoDetailResponse getVideoByIdWithProgress(Long videoId, Long userId);

    List<VideoSummaryResponse> getVideosByLessonId(Long lessonId);

    List<VideoSummaryResponse> getVideosByCourseId(Long courseId);

    List<VideoSummaryResponse> getVideosByModuleId(Long moduleId);

    PageResponse<VideoSummaryResponse> getVideosByLessonId(Long lessonId, int pageNo, int pageSize, String sortBy, String sortDir);

    PageResponse<VideoSummaryResponse> getVideosByCourseId(Long courseId, int pageNo, int pageSize, String sortBy, String sortDir);

    PageResponse<VideoSummaryResponse> getAllVideos(int pageNo, int pageSize, String sortBy, String sortDir);

    PageResponse<VideoSummaryResponse> getVideosByCreator(Long createdBy, int pageNo, int pageSize);

    PageResponse<VideoSummaryResponse> searchVideos(String keyword, int pageNo, int pageSize);

    void deleteVideo(Long videoId);

    void activateVideo(Long videoId);

    void deactivateVideo(Long videoId);

    VideoStatsResponse getVideoStats(Long videoId);

    LessonContentResponse getLessonContent(Long lessonId);

    LessonContentResponse getLessonContentWithProgress(Long lessonId, Long userId);

    CourseContentResponse getCourseContent(Long courseId);

    CourseContentResponse getCourseContentWithProgress(Long courseId, Long userId);

    List<VideoResponse> getVideosByIds(List<Long> videoIds);

    void incrementViewCount(Long videoId);
}
