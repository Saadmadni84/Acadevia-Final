package com.acadevia.game.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class SubmitFillPuzzleRequest {
    private List<PuzzleWordAnswer> words;
    private Integer totalTimeSec;

    @Data
    public static class PuzzleWordAnswer {
        private Integer wordIndex;
        private String answer;
        private Boolean hintUsed;
    }
}
