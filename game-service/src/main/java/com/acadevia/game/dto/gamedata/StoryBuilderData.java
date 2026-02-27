package com.acadevia.game.dto.gamedata;

import lombok.Data;
import java.util.List;

@Data
public class StoryBuilderData {
    private List<Sentence> sentences;
    private String title;
    private String language;
    private Integer bonusForPerfectOrder;

    @Data
    public static class Sentence {
        private Integer id;
        private String text;
        private Integer correctPosition;
        private Integer points;
    }
}
