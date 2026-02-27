package com.acadevia.admin.entity;

import com.acadevia.admin.enums.RuleType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "gamification_rules", indexes = {
        @Index(name = "idx_rule_type", columnList = "ruleType", unique = true)
})
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class GamificationRule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, unique = true, length = 30)
    private RuleType ruleType;

    @Column(length = 255)
    private String displayName;

    @Column(length = 500)
    private String description;

    @Column(nullable = false)
    private Integer value;

    @Column
    private Integer minValue;

    @Column
    private Integer maxValue;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(columnDefinition = "JSON")
    private String configJson;

    @Column
    private Long updatedBy;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
