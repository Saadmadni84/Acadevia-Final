package com.acadevia.gamification.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "level_thresholds")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LevelThreshold {

    @Id
    @Column(nullable = false)
    private Integer level;

    @Column(name = "min_xp", nullable = false, unique = true)
    private Long minXp;

    @Column(name = "level_name", nullable = false)
    private String levelName;

    @Column(name = "icon_url")
    private String iconUrl;

    @Column(columnDefinition = "json")
    private String perks;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
