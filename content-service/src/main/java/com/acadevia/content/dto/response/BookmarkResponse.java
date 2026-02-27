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
public class BookmarkResponse {

    private Long id;
    private Long videoId;
    private Long userId;
    private Integer timestampSec;
    private String title;
    private String note;
    private String color;
    private Boolean isImportant;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
