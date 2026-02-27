package com.acadevia.admin.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "system_announcements", indexes = {
        @Index(name = "idx_ann_active", columnList = "isActive, expiresAt")
})
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class SystemAnnouncement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 300)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(length = 20)
    @Builder.Default
    private String severity = "INFO";

    @Column(length = 50)
    @Builder.Default
    private String targetAudience = "ALL";

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isPinned = false;

    private LocalDateTime expiresAt;

    @Column(nullable = false)
    private Long createdBy;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
