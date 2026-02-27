package com.acadevia.user.dto;

import com.acadevia.user.entity.State;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StateDto {
    private Long id;
    private String name;
    private String nameLocal;
    private String code;
    private String defaultLanguage;
    private State.Region region;
    private Boolean isUnionTerritory;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
