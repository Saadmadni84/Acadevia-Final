package com.acadevia.game.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class SubmitQuizBattleRequest {
    private List<QuizBattleAnswer> answers;
    private Integer totalTimeSec;

    @Data
    public static class QuizBattleAnswer {
        private Integer questionIndex;
        private Integer selectedOption;
        private Integer timeTakenSec;
    }
}
