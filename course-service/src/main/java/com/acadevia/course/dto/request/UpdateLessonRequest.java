package com.acadevia.course.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateLessonRequest {

    private String title;
    private String description;
    private String contentType;
    private String contentUrl;
    private String contentText;
    private Long videoId;
    private Long quizId;
    private Long gameId;
    private Integer durationMinutes;
    private Integer sequenceOrder;
    private Integer xpReward;
    private Boolean isFreePreview;
    private Boolean isMandatory;
    private String language;
    private List<String> attachmentUrls;
}
