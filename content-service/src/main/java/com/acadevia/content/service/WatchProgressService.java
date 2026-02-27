package com.acadevia.content.service;

import com.acadevia.content.dto.request.WatchProgressUpdateRequest;
import com.acadevia.content.dto.response.UserVideoProgressResponse;
import com.acadevia.content.dto.response.WatchProgressResponse;

import java.util.List;

public interface WatchProgressService {

    WatchProgressResponse updateWatchProgress(WatchProgressUpdateRequest request);

    WatchProgressResponse getWatchProgress(Long videoId, Long userId);

    List<WatchProgressResponse> getUserWatchHistory(Long userId);

    List<WatchProgressResponse> getCompletedVideos(Long userId);

    List<WatchProgressResponse> getInProgressVideos(Long userId);

    UserVideoProgressResponse getUserVideoProgress(Long videoId, Long userId);

    Double getCourseWatchProgress(Long courseId, Long userId);

    Double getLessonWatchProgress(Long lessonId, Long userId);
}
