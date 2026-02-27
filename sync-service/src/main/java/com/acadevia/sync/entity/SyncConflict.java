package com.acadevia.sync.entity;

import com.acadevia.sync.enums.ConflictResolutionStrategy;
import com.acadevia.sync.enums.SyncEntityType;
import com.acadevia.sync.enums.SyncStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "sync_conflict")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SyncConflict {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String conflictId;

    private Long userId;
    private String deviceId;

    @Enumerated(EnumType.STRING)
    private SyncEntityType entityType;

    private String entityId;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String serverPayload;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String clientPayload;

    private Integer serverVersion;
    private Integer clientVersion;

    @Column(name = "detected_at")
    private LocalDateTime detectedAt;

    private LocalDateTime resolvedAt;

    @Enumerated(EnumType.STRING)
    private SyncStatus status; // CONFLICT, RESOLVED

    @Enumerated(EnumType.STRING)
    private ConflictResolutionStrategy resolutionStrategy;
    
    private String resolvedBy; // AUTO or USER
}
