package com.acadevia.game.engine.impl;

import com.acadevia.game.dto.game.GameResult;
import com.acadevia.game.dto.gamedata.WordScrambleData;
import com.acadevia.game.dto.request.SubmitGameRequest;
import com.acadevia.game.engine.GameEngine;
import com.acadevia.game.entity.Game;
import com.acadevia.game.entity.GameAttempt;
import com.acadevia.game.entity.enums.GameType;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class WordScrambleEngine implements GameEngine {

    private final ObjectMapper objectMapper;

    @Override
    public boolean supports(String gameType) {
        return GameType.WORD_SCRAMBLE.name().equals(gameType);
    }

    @Override
    @SuppressWarnings("unchecked")
    public GameResult processSubmission(Game game, GameAttempt attempt, SubmitGameRequest submission) {
       try {
            WordScrambleData gameData = objectMapper.readValue(game.getGameData(), WordScrambleData.class);
            // Assuming generic submission structure or specific DTO
            // For word scramble, submission might be List<String> userAnswers
            
            List<String> userAnswers = (List<String>) submission.getSubmissionData().get("answers");
            
            int score = 0;
            int maxScore = gameData.getWords().size() * 10;
            int correctCount = 0;
            
            // Simplified matching logic
            for (int i = 0; i < Math.min(userAnswers.size(), gameData.getWords().size()); i++) {
                String correctWord = gameData.getWords().get(i).getAnswer();
                if (userAnswers.get(i).equalsIgnoreCase(correctWord)) {
                    score += 10;
                    correctCount++;
                }
            }
            
            boolean isWon = correctCount == gameData.getWords().size();
            
            Map<String, Object> details = new HashMap<>();
            details.put("correctCount", correctCount);
            
            return GameResult.builder()
                .score(score)
                .maxScore(maxScore)
                .percentage(BigDecimal.valueOf(score * 100.0 / maxScore))
                .isWon(isWon)
                .isPerfect(isWon)
                .xpEarned(score)
                .creditsEarned(score / 5)
                .resultDetails(details)
                .build();
                
        } catch (Exception e) {
            log.error("Error processing word scramble submission", e);
            throw new RuntimeException("Error processing submission", e);
        }
    }
}
