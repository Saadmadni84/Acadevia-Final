package com.acadevia.game.dto.response;

import com.acadevia.game.entity.enums.GameDifficulty;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ConceptResponse {
    private Long id;
    private Long chapterId;
    private Long subjectId;
    private Integer classGrade;
    private String title;
    private String titleLocal;
    private String description;
    private Integer sequenceOrder;
    private GameDifficulty difficulty;
    private Integer totalGames;
    private String iconUrl;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
