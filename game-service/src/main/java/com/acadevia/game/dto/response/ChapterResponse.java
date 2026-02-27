package com.acadevia.game.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ChapterResponse {
    private Long id;
    private Long subjectId;
    private Integer classGrade;
    private String title;
    private String titleLocal;
    private String description;
    private Integer sequenceOrder;
    private Integer totalConcepts;
    private Integer totalGames;
    private String iconUrl;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
