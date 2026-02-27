package com.acadevia.game.dto.gamedata;

import lombok.Data;
import java.util.List;

@Data
public class WordScrambleData {
    private List<Word> words;
    private Integer timePerWord;
    private Integer showHintAfter;
    private Boolean allowSkip;

    @Data
    public static class Word {
        private String scrambled;
        private String answer;
        private String hint;
        private String category;
        private Integer points;
        private Integer bonusPoints;
    }
}
