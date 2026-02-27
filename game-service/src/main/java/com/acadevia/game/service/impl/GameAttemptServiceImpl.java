package com.acadevia.game.service.impl;

import com.acadevia.game.dto.game.GameResult;
import com.acadevia.game.dto.request.StartGameRequest;
import com.acadevia.game.dto.request.SubmitGameRequest;
import com.acadevia.game.dto.response.GameResultResponse;
import com.acadevia.game.engine.GameEngine;
import com.acadevia.game.engine.GameEngineProvider;
import com.acadevia.game.entity.Game;
import com.acadevia.game.entity.GameAttempt;
import com.acadevia.game.entity.enums.GameMode;
import com.acadevia.game.exception.ResourceNotFoundException;
import com.acadevia.game.mapper.AttemptMapper;
import com.acadevia.game.repository.GameAttemptRepository;
import com.acadevia.game.repository.GameRepository;
import com.acadevia.game.service.GameAttemptService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class GameAttemptServiceImpl implements GameAttemptService {

    private final GameRepository gameRepository;
    private final GameAttemptRepository attemptRepository;
    private final GameEngineProvider engineProvider;
    private final AttemptMapper attemptMapper;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public GameAttempt startGame(StartGameRequest request) {
        Long userId = getCurrentUserId();
        
        Game game = gameRepository.findById(request.getGameId())
                .orElseThrow(() -> new ResourceNotFoundException("Game not found with id: " + request.getGameId()));

        GameAttempt attempt = new GameAttempt();
        attempt.setGame(game);
        attempt.setUserId(userId);
        attempt.setGameMode(request.getIsChallenge() ? GameMode.CHALLENGE : GameMode.SOLO);
        attempt.setDifficultyPlayed(game.getDifficulty());
        attempt.setPlayedAt(LocalDateTime.now());
        
        // Initialize other fields if necessary
        
        game.setTotalPlays(game.getTotalPlays() + 1);
        gameRepository.save(game);
        
        return attemptRepository.save(attempt);
    }

    @Override
    @Transactional
    public GameResultResponse submitGame(SubmitGameRequest request) {
        GameAttempt attempt = attemptRepository.findById(request.getAttemptId())
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found with id: " + request.getAttemptId()));

        if (attempt.getCompletedAt() != null) {
            throw new IllegalStateException("Game attempt already completed");
        }

        Game game = attempt.getGame();
        GameEngine engine = engineProvider.getEngine(game.getGameType());
        
        if (engine == null) {
            throw new UnsupportedOperationException("No engine found for game type: " + game.getGameType());
        }

        GameResult result = engine.processSubmission(game, attempt, request);
        
        // Update attempt with results
        attempt.setScore(result.getScore());
        attempt.setMaxScore(result.getMaxScore());
        attempt.setPercentage(result.getPercentage());
        attempt.setTimeTakenSec((int) ((System.currentTimeMillis() - attempt.getPlayedAt().getSecond()) / 1000)); // Simplified time calculation
        attempt.setIsWon(result.getIsWon());
        attempt.setIsPerfect(result.getIsPerfect());
        attempt.setXpEarned(result.getXpEarned());
        attempt.setCreditsEarned(result.getCreditsEarned());
        attempt.setCompletedAt(LocalDateTime.now());
        
        try {
            attempt.setResultData(objectMapper.writeValueAsString(result.getResultDetails()));
        } catch (JsonProcessingException e) {
            log.error("Error serializing result details", e);
        }

        attemptRepository.save(attempt);

        return attemptMapper.toResultResponse(attempt, result);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<GameAttempt> getUserAttempts(Long userId, Pageable pageable) {
        return attemptRepository.findByUserIdOrderByPlayedAtDesc(userId, pageable);
    }
    
    @Override
    @Transactional(readOnly = true)
    public GameAttempt getAttemptById(Long attemptId) {
        return attemptRepository.findById(attemptId)
            .orElseThrow(() -> new ResourceNotFoundException("Attempt not found: " + attemptId));
    }

    @Override
    @Transactional
    public void cleanupStaleAttempts(LocalDateTime thresholdTime) {
        // Implementation for cleanup logic
    }
    
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            // For dev purposes, return a dummy ID if no auth context
            return 1L; 
        }
        // Assuming the principal is strictly the user ID or convertible to it
        // In a real app, parse the principal object
        try {
            return Long.parseLong(authentication.getName());
        } catch (NumberFormatException e) {
             return 1L; // Fallback
        }
    }
}
