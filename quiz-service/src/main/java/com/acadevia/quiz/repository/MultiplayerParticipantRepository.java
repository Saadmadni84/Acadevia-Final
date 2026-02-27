package com.acadevia.quiz.repository;

import com.acadevia.quiz.entity.MultiplayerParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MultiplayerParticipantRepository extends JpaRepository<MultiplayerParticipant, Long> {
    
    Optional<MultiplayerParticipant> findBySessionIdAndUserId(Long sessionId, Long userId);
    
    boolean existsBySessionIdAndUserId(Long sessionId, Long userId);
    
    List<MultiplayerParticipant> findBySessionIdOrderByScoreDesc(Long sessionId);
}
