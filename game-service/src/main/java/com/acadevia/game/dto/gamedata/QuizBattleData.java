package com.acadevia.game.dto.gamedata;

import lombok.Data;
import java.util.List;

@Data
public class QuizBattleData {
    private List<Question> questions;
    private Integer timePerQuestion;
    private Boolean showExplanation;
    private Boolean shuffleQuestions;
    private Boolean shuffleOptions;

    @Data
    public static class Question {
        private String question;
        private List<String> options;
        private Integer correct; // index
        private String explanation;
        private Integer points;
        private String difficulty; // EASY, MEDIUM, HARD
    }
}
