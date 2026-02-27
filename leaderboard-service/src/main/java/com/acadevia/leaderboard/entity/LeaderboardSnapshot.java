package com.acadevia.leaderboard.entity;

import com.acadevia.leaderboard.enums.GeoScope;
import com.acadevia.leaderboard.enums.LeaderboardStatus;
import com.acadevia.leaderboard.enums.SubjectScope;
import com.acadevia.leaderboard.enums.TimeScope;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "leaderboard_snapshots", indexes = {
        @Index(name = "idx_snapshot_lookup", columnList = "timeScope, geoScope, scopeValue, date, subject")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private TimeScope timeScope;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private GeoScope geoScope;

    @Column(nullable = false)
    private String scopeValue; // "IN", "US-ny", "school-123"

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private SubjectScope subject;

    @Column(nullable = false)
    private LocalDate date; // The day/week/month this snapshot represents

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private LeaderboardStatus status; // FINALIZED, PROCESSING

    private LocalDateTime createdAt;
    private LocalDateTime finalizedAt;

    @Lob
    @Column(columnDefinition = "JSON")
    private String topEntriesJson; // Storing top 100 as JSON for quick history retrieval

    @Column(nullable = false)
    private long totalParticipants;
}
