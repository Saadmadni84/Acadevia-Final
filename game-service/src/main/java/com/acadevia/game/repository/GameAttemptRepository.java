package com.acadevia.game.repository;

import com.acadevia.game.entity.GameAttempt;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GameAttemptRepository extends JpaRepository<GameAttempt, Long> {
    List<GameAttempt> findByUserIdAndGameIdOrderByPlayedAtDesc(Long userId, Long gameId);
    Page<GameAttempt> findByUserIdOrderByPlayedAtDesc(Long userId, Pageable pageable);
    Optional<GameAttempt> findBySessionIdAndUserId(Long sessionId, Long userId);
}
