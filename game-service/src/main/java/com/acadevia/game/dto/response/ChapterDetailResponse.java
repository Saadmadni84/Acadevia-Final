package com.acadevia.game.dto.response;

import lombok.Data;
import java.util.List;

@Data
@lombok.EqualsAndHashCode(callSuper = false)
public class ChapterDetailResponse extends ChapterResponse {
    private List<ConceptResponse> concepts;
}
