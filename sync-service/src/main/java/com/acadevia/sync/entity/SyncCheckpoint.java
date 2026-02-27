package com.acadevia.sync.entity;

import com.acadevia.sync.enums.SyncEntityType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "sync_checkpoint")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SyncCheckpoint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String deviceId;

    @Column(nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SyncEntityType entityType;

    // Use a logical timestamp (vector clock) or sequence number for consistent sync
    @Column(nullable = false)
    private Long lastSequenceNumber;

    private LocalDateTime lastSyncTime;
    
    // Checksum of the data set at this checkpoint to detect drift
    private String dataChecksum;
}
