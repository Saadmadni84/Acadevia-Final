package com.acadevia.course.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReorderLessonsRequest {

    @NotEmpty(message = "Items list cannot be empty")
    private List<ReorderItem> items;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReorderItem {
        private Long lessonId;
        private Integer sequenceOrder;
    }
}
