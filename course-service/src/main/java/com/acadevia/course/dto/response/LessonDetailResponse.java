package com.acadevia.course.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class LessonDetailResponse extends LessonResponse {
    private String contentUrl;
    private String contentText;
    private List<String> attachmentUrls;
    private LessonProgressInfo progressInfo;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LessonProgressInfo {
        private Boolean isCompleted;
        private Double progressPct;
        private Integer timeSpentSec;
        private Integer lastPosition;
        private Integer attempts;
        private Integer score;
    }
}
