package com.acadevia.game.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class SubmitSpeedMathRequest {
    private List<SpeedMathAnswer> answers;
    private Integer totalTimeSec;

    @Data
    public static class SpeedMathAnswer {
        private Integer problemIndex;
        private String answer;
        private Integer timeTakenSec;
    }
}
