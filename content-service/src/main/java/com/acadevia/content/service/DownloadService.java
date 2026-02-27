package com.acadevia.content.service;

import com.acadevia.content.dto.request.DownloadRequest;
import com.acadevia.content.dto.response.DownloadResponse;
import com.acadevia.content.dto.response.PageResponse;

import java.util.List;

public interface DownloadService {

    DownloadResponse requestDownload(DownloadRequest request);

    DownloadResponse getDownloadById(Long downloadId);

    DownloadResponse getDownloadByToken(String token);

    PageResponse<DownloadResponse> getUserDownloads(Long userId, int pageNo, int pageSize);

    List<DownloadResponse> getActiveDownloads(Long userId);

    void cancelDownload(Long downloadId);

    void deleteDownload(Long downloadId);

    void retryDownload(Long downloadId);

    void cleanupExpiredDownloads();
}
