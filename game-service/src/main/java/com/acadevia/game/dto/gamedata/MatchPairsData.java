package com.acadevia.game.dto.gamedata;

import lombok.Data;
import java.util.List;

@Data
public class MatchPairsData {
    private List<Pair> pairs;
    private Boolean shuffleSides;
    private Boolean showTimer;
    private Integer maxAttempts;
    private Integer penaltyPerWrongMatch;

    @Data
    public static class Pair {
        private String left;
        private String right;
        private String category;
        private Integer points;
    }
}
