package com.acadevia.sync.entity;

import com.acadevia.sync.enums.SyncStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "sync_batch")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SyncBatch {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String batchId; // UUID
    
    private String deviceId;
    private Long userId;
    
    private Integer totalItems;
    private Integer processedItems;
    private Integer failedItems;
    
    @Enumerated(EnumType.STRING)
    private SyncStatus status;
    
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
}
