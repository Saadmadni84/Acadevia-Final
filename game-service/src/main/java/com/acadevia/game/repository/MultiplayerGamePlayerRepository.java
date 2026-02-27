package com.acadevia.game.repository;

import com.acadevia.game.entity.MultiplayerGamePlayer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MultiplayerGamePlayerRepository extends JpaRepository<MultiplayerGamePlayer, Long> {
    Optional<MultiplayerGamePlayer> findBySessionIdAndUserId(Long sessionId, Long userId);
    List<MultiplayerGamePlayer> findBySessionId(Long sessionId);
}
