package com.acadevia.course.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompleteLessonRequest {
    private Integer timeSpentSec;
    private Integer score; // optional, for quiz/game lessons
}
