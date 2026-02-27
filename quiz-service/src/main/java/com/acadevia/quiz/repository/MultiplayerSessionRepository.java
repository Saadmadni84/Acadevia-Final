package com.acadevia.quiz.repository;

import com.acadevia.quiz.entity.MultiplayerSession;
import com.acadevia.quiz.entity.enums.SessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface MultiplayerSessionRepository extends JpaRepository<MultiplayerSession, Long> {
    
    Optional<MultiplayerSession> findBySessionCode(String sessionCode);
    
    @Query("SELECT ms FROM MultiplayerSession ms WHERE ms.status = 'WAITING' AND ms.expiresAt < :now")
    List<MultiplayerSession> findExpiredSessions(LocalDateTime now);
}
