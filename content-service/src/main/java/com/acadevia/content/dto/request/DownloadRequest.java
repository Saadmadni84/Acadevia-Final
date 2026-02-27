package com.acadevia.content.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DownloadRequest {

    @NotNull(message = "Video ID is required")
    private Long videoId;

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Lesson ID is required")
    private Long lessonId;

    @NotNull(message = "Course ID is required")
    private Long courseId;

    @NotBlank(message = "Quality is required")
    private String quality;

    @Size(max = 100)
    private String deviceId;

    @Size(max = 100)
    private String deviceName;

    @Size(max = 50)
    private String platform;
}
