package com.acadevia.game.dto.gamedata;

import lombok.Data;
import java.util.List;

@Data
public class SpeedMathData {
    private List<Problem> problems;
    private Integer timePerProblem;
    private Integer bonusTimeThreshold;
    private Boolean showCalculator;

    @Data
    public static class Problem {
        private String question;
        private String answer;
        private List<String> acceptableAnswers;
        private Integer points;
        private Integer timeBonus;
        private String difficulty; // EASY, MEDIUM, HARD
    }
}
