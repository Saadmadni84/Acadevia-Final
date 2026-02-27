package com.acadevia.game.engine;

import com.acadevia.game.dto.game.GameResult;
import com.acadevia.game.dto.request.SubmitGameRequest;
import com.acadevia.game.entity.Game;
import com.acadevia.game.entity.GameAttempt;

public interface GameEngine {
    GameResult processSubmission(Game game, GameAttempt attempt, SubmitGameRequest submission);
    boolean supports(String gameType);
}
