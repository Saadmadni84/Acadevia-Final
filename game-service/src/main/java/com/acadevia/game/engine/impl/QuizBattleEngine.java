package com.acadevia.game.engine.impl;

import com.acadevia.game.dto.game.GameResult;
import com.acadevia.game.dto.gamedata.QuizBattleData;
import com.acadevia.game.dto.request.SubmitGameRequest;
import com.acadevia.game.dto.request.SubmitQuizBattleRequest;
import com.acadevia.game.engine.GameEngine;
import com.acadevia.game.entity.Game;
import com.acadevia.game.entity.GameAttempt;
import com.acadevia.game.entity.enums.GameType;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class QuizBattleEngine implements GameEngine {

    private final ObjectMapper objectMapper;

    @Override
    public boolean supports(String gameType) {
        return GameType.QUIZ_BATTLE.name().equals(gameType);
    }

    @Override
    public GameResult processSubmission(Game game, GameAttempt attempt, SubmitGameRequest submission) {
        try {
            // Parse Game Data
            QuizBattleData gameData = objectMapper.readValue(game.getGameData(), QuizBattleData.class);
            
            // Parse Submission Data
            SubmitQuizBattleRequest request = objectMapper.convertValue(submission.getSubmissionData(), SubmitQuizBattleRequest.class);
            
            int score = 0;
            int maxScore = 0;
            int correctCount = 0;
            
            // Calculate Score
            for (SubmitQuizBattleRequest.QuizBattleAnswer answer : request.getAnswers()) {
                if (answer.getQuestionIndex() < gameData.getQuestions().size()) {
                    QuizBattleData.Question question = gameData.getQuestions().get(answer.getQuestionIndex());
                    maxScore += question.getPoints() != null ? question.getPoints() : 10;
                    
                    if (question.getCorrect().equals(answer.getSelectedOption())) {
                        score += question.getPoints() != null ? question.getPoints() : 10;
                        correctCount++;
                    }
                }
            }
            
            BigDecimal percentage = maxScore > 0 
                ? BigDecimal.valueOf((double) score / maxScore * 100) 
                : BigDecimal.ZERO;
                
            boolean isWon = percentage.doubleValue() >= 70.0; // Threshold logic
            boolean isPerfect = score == maxScore && maxScore > 0;
            
            // XP Calculation (simplified)
            int xp = score / 2;
            if (isWon) xp += 50;
            if (isPerfect) xp += 100;
            
            Map<String, Object> details = new HashMap<>();
            details.put("correctCount", correctCount);
            details.put("totalQuestions", gameData.getQuestions().size());
            
            return GameResult.builder()
                .score(score)
                .maxScore(maxScore)
                .percentage(percentage)
                .isWon(isWon)
                .isPerfect(isPerfect)
                .xpEarned(xp)
                .creditsEarned(xp / 10)
                .resultDetails(details)
                .build();
                
        } catch (JsonProcessingException e) {
            log.error("Error processing quiz battle submission", e);
            throw new RuntimeException("Error processing submission", e);
        }
    }
}
