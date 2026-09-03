package com.acadevia.content.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VideoUploadResponse {
    private Long videoId;
    private Long lessonId;
    private Long courseId;
    private String title;
    private String objectKey;
    private String bucket;
    private String originalFilename;
    private String contentType;
    private Long fileSizeBytes;
    private Double fileSizeMb;
    private String playUrl;
    private LocalDateTime createdAt;
}
