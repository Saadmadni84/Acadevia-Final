package com.acadevia.game.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class SubmitWordScrambleRequest {
    private List<WordScrambleAnswer> answers;
    private Integer totalTimeSec;

    @Data
    public static class WordScrambleAnswer {
        private Integer wordIndex;
        private String answer;
        private Boolean hintUsed;
        private Integer timeTakenSec;
    }
}
