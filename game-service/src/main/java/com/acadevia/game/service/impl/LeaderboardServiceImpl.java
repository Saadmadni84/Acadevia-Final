package com.acadevia.game.service.impl;

import com.acadevia.game.dto.game.LeaderboardEntry;
import com.acadevia.game.entity.GameLeaderboardEntry;
import com.acadevia.game.repository.GameLeaderboardEntryRepository;
import com.acadevia.game.service.LeaderboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeaderboardServiceImpl implements LeaderboardService {

    private final GameLeaderboardEntryRepository leaderboardRepository;
    private final com.acadevia.game.repository.GameRepository gameRepository;

    @Override
    @Transactional(readOnly = true)
    public List<LeaderboardEntry> getGlobalLeaderboard(int limit) {
        // Assuming we want top players by total XP or score across all games
        // Or specific global table.
        // For simplicity, let's use the repository to fetch top entries by score
        // We'll map entity to DTO manually or via mapper if exists
        
        Pageable pageable = PageRequest.of(0, limit, Sort.by("score").descending());
        // This is simplified. Real implementation might aggregate user scores.
        
        return leaderboardRepository.findAll(pageable).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaderboardEntry> getFriendsLeaderboard(Long userId, int limit) {
        // Mock implementation as we don't have friends service yet
        return Collections.emptyList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaderboardEntry> getGameLeaderboard(Long gameId, LocalDateTime startDate, int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return leaderboardRepository.findTopExByGameId(gameId, pageable).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Async
    @Transactional
    public void updateLeaderboardAsync(Long userId, Long gameId, int score) {
        com.acadevia.game.entity.GameLeaderboardEntry entry = leaderboardRepository.findByGame_IdAndUserId(gameId, userId)
                .orElse(null);
        
        if (entry == null) {
            entry = new com.acadevia.game.entity.GameLeaderboardEntry();
            entry.setGame(gameRepository.getReferenceById(gameId));
            entry.setUserId(userId);
            entry.setBestScore(score);
            entry.setTotalPlays(1);
        } else {
            if (score > entry.getBestScore()) {
                entry.setBestScore(score);
            }
            entry.setTotalPlays(entry.getTotalPlays() + 1);
        }
        leaderboardRepository.save(entry);
    }
    
    private LeaderboardEntry mapToDto(GameLeaderboardEntry entity) {
        LeaderboardEntry dto = new LeaderboardEntry();
        dto.setUserId(entity.getUserId());
        dto.setRank(0); // Needs calculation
        dto.setScore(entity.getBestScore());
        // dto.setUsername("User " + entity.getUserId()); // Placeholder
        return dto;
    }
}
