package com.acadevia.game.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class SubmitStoryBuilderRequest {
    private List<Integer> submittedOrder;
    private Integer totalTimeSec;
}
