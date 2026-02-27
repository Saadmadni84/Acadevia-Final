package com.acadevia.sync.service;

import com.acadevia.sync.entity.ContentCache;
import com.acadevia.sync.enums.DownloadQuality;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class ContentCacheService {

    public ContentCache getContentInfo(String contentType, String contentId) {
        // Stub: In production, fetch from content-service or local cache table
        return ContentCache.builder()
                .contentId(contentId)
                .s3Url("https://cdn.acadevia.com/content/" + contentType + "/" + contentId)
                .fileSize(10L * 1024 * 1024) // default 10MB
                .checksum("stub-checksum")
                .mimeType("application/octet-stream")
                .version("1.0")
                .build();
    }

    public long getFileSizeForQuality(ContentCache content, DownloadQuality quality) {
        if (content.getFileSize() != null) {
            return content.getFileSize();
        }
        return 10L * 1024 * 1024; // default 10MB
    }

    public String getUrlForQuality(ContentCache content, DownloadQuality quality) {
        return content.getS3Url() + "/" + quality.name().toLowerCase();
    }
}
