package com.acadevia.game.dto.gamedata;

import lombok.Data;
import java.util.Map;
import java.util.List;

@Data
public class ExperimentSimulatorData {
    private String experimentTitle;
    private List<Step> steps;
    private String conclusion;
    private Integer totalPoints;
    private VisualAssets visualAssets;

    @Data
    public static class Step {
        private Integer stepNumber;
        private String instruction;
        private String action; // e.g., PLACE_ITEM, FLICK
        private Map<String, String> correctAction;
        private String feedback;
        private Integer points;
    }

    @Data
    public static class VisualAssets {
        private String backgroundUrl;
        private Map<String, String> itemUrls;
    }
}
