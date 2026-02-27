package com.acadevia.content.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NoteCreateRequest {

    @NotNull(message = "Video ID is required")
    private Long videoId;

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Timestamp is required")
    @Min(value = 0, message = "Timestamp must be non-negative")
    private Integer timestampSec;

    @NotBlank(message = "Content is required")
    private String content;

    private String formattedContent;

    @Builder.Default
    private Boolean hasDrawing = false;

    private String drawingData;

    private String screenshotUrl;

    @Builder.Default
    private Boolean isPinned = false;
}
