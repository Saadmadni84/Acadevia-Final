package com.acadevia.gamification.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "gamification_rules")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GamificationRule {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "rule_name", nullable = false, unique = true)
    private String ruleName;

    @Column(name = "action_type", nullable = false)
    private String actionType; // 'QUIZ_COMPLETE', 'LOGIN', etc.

    @Column(name = "display_name")
    private String displayName;

    @Column
    private String description;

    @Column(name = "xp_value", nullable = false)
    private Integer xpValue;

    @Column(name = "credit_value", nullable = false)
    private Integer creditValue;

    @Column
    private String category;

    @Column(name = "max_per_day", nullable = false)
    private Integer maxPerDay;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
