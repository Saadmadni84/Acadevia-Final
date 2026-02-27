package com.acadevia.game.repository;

import com.acadevia.game.entity.MultiplayerGameSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MultiplayerGameSessionRepository extends JpaRepository<MultiplayerGameSession, Long> {
    Optional<MultiplayerGameSession> findBySessionCode(String sessionCode);
}
