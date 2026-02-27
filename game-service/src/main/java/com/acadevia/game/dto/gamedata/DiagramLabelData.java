package com.acadevia.game.dto.gamedata;

import lombok.Data;
import java.util.List;

@Data
public class DiagramLabelData {
    private String diagramUrl;
    private String diagramTitle;
    private List<Label> labels;
    private List<String> availableLabels;
    private List<String> distractorLabels;

    @Data
    public static class Label {
        private String id;
        private String correctText;
        private Position position;
        private String hint;
        private Integer points;
    }

    @Data
    public static class Position {
        private Integer x;
        private Integer y;
    }
}
