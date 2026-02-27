package com.acadevia.game.repository;

import com.acadevia.game.entity.GameLeaderboardEntry;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GameLeaderboardEntryRepository extends JpaRepository<GameLeaderboardEntry, Long> {
    Optional<GameLeaderboardEntry> findByGame_IdAndUserId(Long gameId, Long userId);
    
    @Query("SELECT e FROM GameLeaderboardEntry e WHERE e.game.id = :gameId ORDER BY e.bestScore DESC")
    List<GameLeaderboardEntry> findTopExByGameId(Long gameId, Pageable pageable);
    
    @Query(value = "SELECT COUNT(*) + 1 FROM game_leaderboard_entries e WHERE e.game_id = :gameId AND (e.best_score > :score OR (e.best_score = :score AND e.best_time_sec < :time))", nativeQuery = true)
    Integer calculateRank(Long gameId, Integer score, Integer time);
}
