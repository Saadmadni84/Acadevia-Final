package com.acadevia.quiz.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "multiplayer_participants")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MultiplayerParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "session_id", nullable = false)
    private Long sessionId;
    
    @Column(nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", insertable = false, updatable = false)
    private MultiplayerSession session;

    private String displayName;
    @Column(length = 500)
    private String avatarUrl;

    @Column(columnDefinition = "INT DEFAULT 0")
    private Integer score;

    @Column(columnDefinition = "INT DEFAULT 0")
    private Integer correctAnswers;

    @Column(columnDefinition = "INT DEFAULT 0")
    private Integer wrongAnswers;

    @Column(columnDefinition = "INT DEFAULT 0")
    private Integer totalTimeSec;

    private Integer rankPosition;

    @Column(columnDefinition = "INT DEFAULT 0")
    private Integer xpEarned;

    @Column(columnDefinition = "INT DEFAULT 0")
    private Integer creditsEarned;

    @Column(columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean isReady;

    @Column(columnDefinition = "BOOLEAN DEFAULT TRUE")
    private Boolean isConnected;

    @Column(columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean isFinished;

    @CreationTimestamp
    private LocalDateTime joinedAt;

    private LocalDateTime finishedAt;
}
