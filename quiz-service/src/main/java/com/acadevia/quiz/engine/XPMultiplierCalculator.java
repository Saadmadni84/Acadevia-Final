package com.acadevia.quiz.engine;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class XPMultiplierCalculator {

    public int calculateXP(boolean isCorrect, int baseXP, int timeTakenSec, int expectedTimeSec, 
                          boolean isStreak, int streakCount, String difficulty) {
        if (!isCorrect) {
            return 0; // Or small participation points
        }
        
        double multiplier = 1.0;
        
        // Speed Bonus
        if (timeTakenSec < expectedTimeSec * 0.5) {
            multiplier += 0.5; // Fast answer
        } else if (timeTakenSec < expectedTimeSec * 0.8) {
            multiplier += 0.2;
        }
        
        // Streak Bonus
        if (isStreak) {
            if (streakCount >= 5) multiplier += 0.5;
            else if (streakCount >= 3) multiplier += 0.2;
        }
        
        // Difficulty Bonus
        if ("HARD".equalsIgnoreCase(difficulty)) {
            multiplier += 0.5;
        } else if ("MEDIUM".equalsIgnoreCase(difficulty)) {
            multiplier += 0.2;
        }
        
        return (int) (baseXP * multiplier);
    }
    
    public int calculateProjectedXP(int totalQuestions, int xpPerCorrect, int xpBonusPerfect) {
        return (totalQuestions * xpPerCorrect) + xpBonusPerfect;
    }
}
