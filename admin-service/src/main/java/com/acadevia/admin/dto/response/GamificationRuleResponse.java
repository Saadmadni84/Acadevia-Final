package com.acadevia.admin.dto.response;
import com.acadevia.admin.enums.RuleType;
import lombok.*;
import java.time.LocalDateTime;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class GamificationRuleResponse {
    private Long id;
    private RuleType ruleType;
    private String displayName;
    private String description;
    private Integer value;
    private Integer minValue;
    private Integer maxValue;
    private Boolean isActive;
    private String configJson;
    private LocalDateTime updatedAt;
}
