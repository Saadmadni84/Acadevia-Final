package com.acadevia.content.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkVideoRequest {

    @NotNull(message = "Video IDs are required")
    private java.util.List<Long> videoIds;
}
