package com.acadevia.game.dto.gamedata;

import lombok.Data;
import java.util.List;

@Data
public class TimelineArrangeData {
    private List<Event> events;
    private Integer pointsForExactPosition;
    private Integer pointsForAdjacentPosition;
    private Boolean showYears;

    @Data
    public static class Event {
        private String event;
        private Integer year;
        private String description;
        private String imageUrl;
        private Integer points;
    }
}
