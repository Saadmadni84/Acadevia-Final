package com.acadevia.game.dto.response;

import lombok.Data;
import java.util.List;

@Data
public class GameLeaderboardResponse {
    private Long gameId;
    private String gameTitle;
    private List<GameLeaderboardEntryResponse> entries;
    private GameLeaderboardEntryResponse myEntry;
}
