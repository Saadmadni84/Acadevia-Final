package com.acadevia.sync.entity;

import com.acadevia.sync.enums.SyncStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "offline_activity")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OfflineActivity {
    /**
     * Stores high-level user actions performed offline (e.g., "Completed Quiz")
     * separate from the raw granular data sync. Used for analytics/audit.
     */

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private String deviceId;
    private String activityType; // QUIZ_SUBMISSION, VIDEO_WATCHED
    private String referenceId;  // QuizID, etc.
    
    @Lob
    @Column(columnDefinition = "TEXT")
    private String metadata;
    
    private LocalDateTime occurredAt;
    private LocalDateTime syncedAt;
    
    @Enumerated(EnumType.STRING)
    private SyncStatus processStatus; // PROCESSED (sent to analytics), PENDING
}
