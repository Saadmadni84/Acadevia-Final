package com.acadevia.admin.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "feature_flags", indexes = {
        @Index(name = "idx_ff_key", columnList = "flagKey", unique = true)
})
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class FeatureFlag {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String flagKey;

    @Column(length = 255)
    private String displayName;

    @Column(length = 500)
    private String description;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isEnabled = true;

    @Column(length = 50)
    private String scope;

    @Column
    private Long updatedBy;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
