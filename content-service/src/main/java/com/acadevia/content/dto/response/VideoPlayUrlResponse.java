package com.acadevia.content.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VideoPlayUrlResponse {
    private Long videoId;
    private String title;
    private String presignedUrl;
    private String streamUrl;
    private Integer expiresInSeconds;
    private String quality;
}
