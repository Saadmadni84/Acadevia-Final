package com.acadevia.game.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateSubjectRequest {
    @NotBlank
    private String name;
    private String nameLocal;
    @NotBlank
    private String code;
    private String description;
    private String iconUrl;
    private String colorCode;
    private String board;
    private Integer displayOrder;
}
