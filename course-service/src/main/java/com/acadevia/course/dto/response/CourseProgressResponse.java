package com.acadevia.course.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseProgressResponse {
    private Long courseId;
    private String courseTitle;
    private Double overallProgress;
    private Integer completedLessons;
    private Integer totalLessons;
    private Integer totalTimeSpentMin;
    private Integer xpEarned;
    private String status;
    private List<ModuleProgressInfo> modules;
    private NextLessonInfo nextLesson;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ModuleProgressInfo {
        private Long moduleId;
        private String moduleTitle;
        private Integer sequenceOrder;
        private Integer completedLessons;
        private Integer totalLessons;
        private Double moduleProgress;
        private List<LessonProgressInfo> lessons;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LessonProgressInfo {
        private Long lessonId;
        private String lessonTitle;
        private Integer sequenceOrder;
        private Boolean isCompleted;
        private Double progressPct;
        private Integer score;
        private String contentType;
        private Integer durationMinutes;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NextLessonInfo {
        private Long lessonId;
        private String lessonTitle;
        private Long moduleId;
        private String moduleTitle;
        private String contentType;
        private Integer durationMinutes;
    }
}
