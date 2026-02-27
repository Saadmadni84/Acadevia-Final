package com.acadevia.game.mapper;

import com.acadevia.game.dto.game.GameResult;
import com.acadevia.game.dto.response.GameAttemptResponse;
import com.acadevia.game.dto.response.GameResultResponse;
import com.acadevia.game.entity.GameAttempt;
import org.springframework.stereotype.Component;

@Component
public class AttemptMapper {

    public GameAttemptResponse toResponse(GameAttempt attempt) {
        GameAttemptResponse response = new GameAttemptResponse();
        response.setId(attempt.getId());
        response.setGameId(attempt.getGame().getId());
        response.setUserId(attempt.getUserId());
        response.setGameTitle(attempt.getGame().getTitle());
        response.setGameType(attempt.getGame().getGameType().name());
        
        response.setScore(attempt.getScore());
        response.setMaxScore(attempt.getMaxScore());
        response.setPercentage(attempt.getPercentage().doubleValue());
        response.setTimeTakenSec(attempt.getTimeTakenSec());
        
        response.setIsWon(attempt.getIsWon());
        response.setIsPerfect(attempt.getIsPerfect());
        response.setIsSpeedBonus(attempt.getIsSpeedBonus());
        
        response.setXpEarned(attempt.getXpEarned());
        response.setCreditsEarned(attempt.getCreditsEarned());
        
        // Handling potentially null values for enums if they exist in Entity but not initialized
        if (attempt.getGameMode() != null) {
            response.setGameMode(attempt.getGameMode().name());
        }
        if (attempt.getDifficultyPlayed() != null) {
            response.setDifficultyPlayed(attempt.getDifficultyPlayed().name());
        }
        
        response.setPlayedAt(attempt.getPlayedAt());
        return response;
    }

    public GameResultResponse toResultResponse(GameAttempt attempt, GameResult result) {
        return GameResultResponse.builder()
                .attemptId(attempt.getId())
                .gameId(attempt.getGame().getId())
                .gameType(attempt.getGame().getGameType().name())
                .score(attempt.getScore())
                .maxScore(attempt.getMaxScore())
                .percentage(attempt.getPercentage() != null ? attempt.getPercentage().doubleValue() : 0.0)
                .timeTakenSec(attempt.getTimeTakenSec())
                .isWon(attempt.getIsWon())
                .isPerfect(attempt.getIsPerfect())
                .isSpeedBonus(attempt.getIsSpeedBonus())
                .xpEarned(attempt.getXpEarned())
                .creditsEarned(attempt.getCreditsEarned())
                .build();
    }
}
