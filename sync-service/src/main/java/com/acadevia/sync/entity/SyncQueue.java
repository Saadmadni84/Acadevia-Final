package com.acadevia.sync.entity;

import com.acadevia.sync.enums.SyncDirection;
import com.acadevia.sync.enums.SyncEntityType;
import com.acadevia.sync.enums.SyncStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "sync_queue")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SyncQueue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String deviceId;

    @Column(nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    private SyncDirection direction;

    @Enumerated(EnumType.STRING)
    private SyncEntityType entityType;

    private String entityId;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String payloadJson;

    @Column(nullable = false)
    private Integer version;

    @Enumerated(EnumType.STRING)
    private SyncStatus status;

    private Integer retryCount;
    private String errorMessage;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime processedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id")
    private SyncBatch batch;
}
