package com.acadevia.game.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class SubmitTimelineRequest {
    private List<Integer> submittedOrder;
    private Integer totalTimeSec;
}
