package com.acadevia.game.dto.response;

import lombok.Data;
import java.util.List;

@Data
public class SubjectProgressResponse {
    private String subjectCode;
    private String subjectName;
    private Integer classGrade;
    
    private Integer totalChapters;
    private Integer chaptersStarted;
    private Integer chaptersCompleted;
    
    private Integer totalConcepts;
    private Integer conceptsMastered;
    
    private Double overallProgress;
    
    private List<ChapterProgressInfo> chapters;

    @Data
    public static class ChapterProgressInfo {
        private Long chapterId;
        private String title;
        private Integer totalConcepts;
        private Integer conceptsMastered;
        private Double chapterProgress;
        private List<ConceptMasteryResponse> concepts;
    }
}
