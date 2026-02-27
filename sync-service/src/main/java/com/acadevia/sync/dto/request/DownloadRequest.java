package com.acadevia.sync.dto.request;

import com.acadevia.sync.enums.DownloadQuality;
import lombok.Data;

@Data
public class DownloadRequest {
    private String contentId;
    private String contentType;
    private DownloadQuality quality;
}
