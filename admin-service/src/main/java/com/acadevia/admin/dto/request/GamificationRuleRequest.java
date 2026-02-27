package com.acadevia.admin.dto.request;

import com.acadevia.admin.enums.RuleType;
import jakarta.validation.constraints.*;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class GamificationRuleRequest {
    @NotNull private RuleType ruleType;
    @NotNull @Min(0) private Integer value;
    private Integer minValue;
    private Integer maxValue;
    private Boolean isActive;
    private String configJson;
    private String description;
}
