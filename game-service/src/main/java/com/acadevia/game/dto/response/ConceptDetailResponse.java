package com.acadevia.game.dto.response;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
@lombok.EqualsAndHashCode(callSuper = false)
public class ConceptDetailResponse extends ConceptResponse {
    private List<String> keyPoints;
    private List<String> formulas;
    private Map<String, String> definitions;
    private List<String> examples;
}
