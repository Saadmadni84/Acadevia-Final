package com.acadevia.game.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class SubmitDiagramLabelRequest {
    private List<DiagramLabelAnswer> labels;
    private Integer totalTimeSec;

    @Data
    public static class DiagramLabelAnswer {
        private String labelId;
        private String placedText;
    }
}
