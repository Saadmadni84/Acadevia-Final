package com.acadevia.game.entity;

import com.acadevia.game.entity.enums.GameDifficulty;
import com.acadevia.game.entity.enums.GameSessionStatus;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "multiplayer_game_sessions")
public class MultiplayerGameSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "session_code", nullable = false, unique = true, length = 10)
    private String sessionCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_id", nullable = false)
    private Game game;

    @Column(name = "host_user_id", nullable = false)
    private Long hostUserId;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private GameSessionStatus status = GameSessionStatus.WAITING;

    @Column(name = "max_players")
    private Integer maxPlayers = 4;

    @Column(name = "current_players")
    private Integer currentPlayers = 0;

    @Column(name = "time_limit_sec")
    private Integer timeLimitSec;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private GameDifficulty difficulty = GameDifficulty.MEDIUM;

    private Integer rounds = 1;
    
    @Column(name = "current_round")
    private Integer currentRound = 0;

    @Column(name = "winner_user_id")
    private Long winnerUserId;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "ended_at")
    private LocalDateTime endedAt;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
