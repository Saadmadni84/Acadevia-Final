package com.acadevia.game.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class SubmitMatchPairsRequest {
    private List<MatchPairAnswer> matches;
    private Integer totalTimeSec;
    private Integer wrongAttempts;

    @Data
    public static class MatchPairAnswer {
        private Integer leftIndex;
        private Integer rightIndex;
        private Integer timeTakenSec;
    }
}
