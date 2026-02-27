package com.acadevia.game.dto.gamedata;

import lombok.Data;
import java.util.List;

@Data
public class FormulaBuilderData {
    private List<Formula> formulas;

    @Data
    public static class Formula {
        private String target;
        private String targetDisplay;
        private List<String> components;
        private List<String> distractors;
        private String hint;
        private Integer points;
        private Boolean partialCredit;
    }
}
