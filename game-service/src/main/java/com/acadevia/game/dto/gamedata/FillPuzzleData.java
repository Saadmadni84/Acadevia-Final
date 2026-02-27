package com.acadevia.game.dto.gamedata;

import lombok.Data;
import java.util.List;

@Data
public class FillPuzzleData {
    private Grid grid;
    private List<Word> words;
    private Integer hintCost;

    @Data
    public static class Grid {
        private Integer rows;
        private Integer cols;
        private List<Cell> cells;
    }

    @Data
    public static class Cell {
        private Integer row;
        private Integer col;
        private String letter;
        private Integer wordIndex;
        private Integer charIndex;
    }

    @Data
    public static class Word {
        private String word;
        private String clue;
        private String direction; // ACROSS, DOWN
        private Integer startRow;
        private Integer startCol;
        private Integer points;
    }
}
