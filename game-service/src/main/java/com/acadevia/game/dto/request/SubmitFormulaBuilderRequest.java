package com.acadevia.game.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class SubmitFormulaBuilderRequest {
    private List<FormulaAnswer> formulas;
    private Integer totalTimeSec;

    @Data
    public static class FormulaAnswer {
        private Integer formulaIndex;
        private List<String> submittedComponents;
        private Integer timeTakenSec;
    }
}
