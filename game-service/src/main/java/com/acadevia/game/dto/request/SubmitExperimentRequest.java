package com.acadevia.game.dto.request;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class SubmitExperimentRequest {
    private List<ExperimentStepAnswer> steps;
    private Integer totalTimeSec;

    @Data
    public static class ExperimentStepAnswer {
        private Integer stepNumber;
        private Map<String, String> action;
    }
}
