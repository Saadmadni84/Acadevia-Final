package com.acadevia.game.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "multiplayer_game_players", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"session_id", "user_id"})
})
public class MultiplayerGamePlayer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private MultiplayerGameSession session;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "display_name")
    private String displayName;

    @Column(name = "avatar_url")
    private String avatarUrl;

    private Integer score = 0;
    
    @Column(name = "time_taken_sec")
    private Integer timeTakenSec = 0;
    
    @Column(name = "rank_position")
    private Integer rankPosition;

    @Column(name = "xp_earned")
    private Integer xpEarned = 0;

    @Column(name = "credits_earned")
    private Integer creditsEarned = 0;

    @Column(name = "is_ready")
    private Boolean isReady = false;

    @Column(name = "is_connected")
    private Boolean isConnected = true;

    @Column(name = "is_finished")
    private Boolean isFinished = false;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "result_data", columnDefinition = "json")
    private String resultData;

    @Column(name = "joined_at", updatable = false)
    private LocalDateTime joinedAt = LocalDateTime.now();

    @Column(name = "finished_at")
    private LocalDateTime finishedAt;
}
