package com.acadevia.game.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class SubjectResponse {
    private Long id;
    private String name;
    private String nameLocal;
    private String code;
    private String description;
    private String iconUrl;
    private String colorCode;
    private String board;
    private Integer displayOrder;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
