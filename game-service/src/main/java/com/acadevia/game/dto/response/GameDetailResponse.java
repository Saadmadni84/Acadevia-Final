package com.acadevia.game.dto.response;

import lombok.Data;
import java.util.List;

@Data
@lombok.EqualsAndHashCode(callSuper = false)
public class GameDetailResponse extends GameResponse {
    private Object gameData;
    private List<String> tags;
    private String topic;
    private Long createdBy;
    private Long schoolId;
}
