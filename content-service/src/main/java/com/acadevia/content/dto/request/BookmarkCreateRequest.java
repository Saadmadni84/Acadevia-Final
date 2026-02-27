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
public class BookmarkCreateRequest {

    @NotNull(message = "Video ID is required")
    private Long videoId;

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Timestamp is required")
    @Min(value = 0, message = "Timestamp must be non-negative")
    private Integer timestampSec;

    @Size(max = 200)
    private String title;

    private String note;

    @Size(max = 10)
    @Builder.Default
    private String color = "#FFD700";

    @Builder.Default
    private Boolean isImportant = false;
}
