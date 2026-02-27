package com.acadevia.quiz.engine;

import com.acadevia.quiz.entity.Question;
import com.acadevia.quiz.entity.enums.DifficultyLevel;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Random;

@Component
public class AdaptiveEngine {
    
    private final Random random = new Random();

    /**
     * Determines the next difficulty level based on previous answer correctness and time taken.
     */
    public DifficultyLevel getNextDifficulty(DifficultyLevel currentDifficulty, boolean wasCorrect, int timeTakenSec, int expectedTimeSec) {
        // Simple adaptive algorithm
        if (wasCorrect) {
            // If correct and fast, increase difficulty
            if (timeTakenSec < expectedTimeSec * 0.7) {
                return increaseDifficulty(currentDifficulty);
            }
            // If correct but slow, keep same difficulty
            return currentDifficulty;
        } else {
            // If incorrect, decrease difficulty to reinforce learning
            return decreaseDifficulty(currentDifficulty);
        }
    }

    /**
     * Selects the next question from a pool of candidates matching the target difficulty.
     * Ensures we don't repeat questions sent in the 'excludeIds' list.
     */
    public Question selectNextQuestion(List<Question> candidates, List<Long> excludeIds) {
        List<Question> available = candidates.stream()
                .filter(q -> !excludeIds.contains(q.getId()))
                .toList();
        
        if (available.isEmpty()) {
            return null; // No more questions available for this criteria
        }
        
        // Pick random from available
        return available.get(random.nextInt(available.size()));
    }

    private DifficultyLevel increaseDifficulty(DifficultyLevel current) {
        if (current == DifficultyLevel.EASY) return DifficultyLevel.MEDIUM;
        if (current == DifficultyLevel.MEDIUM) return DifficultyLevel.HARD;
        return current;
    }

    private DifficultyLevel decreaseDifficulty(DifficultyLevel current) {
        if (current == DifficultyLevel.HARD) return DifficultyLevel.MEDIUM;
        if (current == DifficultyLevel.MEDIUM) return DifficultyLevel.EASY;
        return current;
    }
}
