package com.acadevia.quiz.entity;

import com.acadevia.quiz.entity.enums.MultiplayerMode;
import com.acadevia.quiz.entity.enums.SessionStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "multiplayer_sessions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MultiplayerSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String sessionCode;

    @Column(name = "quiz_id", nullable = false)
    private Long quizId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", insertable = false, updatable = false)
    private Quiz quiz;

    @Column(nullable = false)
    private Long hostUserId;

    @Enumerated(EnumType.STRING)
    private MultiplayerMode mode;

    @Column(columnDefinition = "INT DEFAULT 4")
    private Integer maxPlayers;

    @Column(columnDefinition = "INT DEFAULT 4")
    private Integer maxParticipants;

    @Column(columnDefinition = "INT DEFAULT 0")
    private Integer currentPlayers;

    @Column(columnDefinition = "INT DEFAULT 0")
    private Integer currentParticipants;

    private Integer entryFee;

    @Column(columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean isPrivate;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "VARCHAR(20) DEFAULT 'WAITING'")
    private SessionStatus status;

    @Column(columnDefinition = "INT DEFAULT 20")
    private Integer questionTimeSec;

    @Column(columnDefinition = "INT DEFAULT 3")
    private Integer breakTimeSec;

    @Column(columnDefinition = "INT DEFAULT 0")
    private Integer currentQuestion;

    @Column(nullable = false)
    private Integer totalQuestions;

    @Column(columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean isPublic;

    @Column(columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean allowLateJoin;

    @Column(columnDefinition = "BOOLEAN DEFAULT TRUE")
    private Boolean showLiveScores;

    private Long winnerUserId;

    private String subject;
    private Integer classGrade;
    private String topic;

    private LocalDateTime startedAt;
    private LocalDateTime startTime;
    private LocalDateTime endedAt;
    
    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL)
    private List<MultiplayerParticipant> participants = new ArrayList<>();
}
