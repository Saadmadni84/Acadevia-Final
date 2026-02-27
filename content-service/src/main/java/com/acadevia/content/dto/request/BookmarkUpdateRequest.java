package com.acadevia.content.dto.request;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookmarkUpdateRequest {

    private Integer timestampSec;

    @Size(max = 200)
    private String title;

    private String note;

    @Size(max = 10)
    private String color;

    private Boolean isImportant;
}
