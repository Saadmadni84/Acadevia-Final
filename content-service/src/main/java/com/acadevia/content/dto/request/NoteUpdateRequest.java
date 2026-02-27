package com.acadevia.content.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NoteUpdateRequest {

    private Integer timestampSec;

    private String content;

    private String formattedContent;

    private Boolean hasDrawing;

    private String drawingData;

    private String screenshotUrl;

    private Boolean isPinned;
}
