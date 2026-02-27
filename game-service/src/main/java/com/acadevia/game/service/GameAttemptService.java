package com.acadevia.game.service;

import com.acadevia.game.dto.response.GameResultResponse;
import com.acadevia.game.dto.request.StartGameRequest;
import com.acadevia.game.dto.request.SubmitGameRequest;
import com.acadevia.game.entity.GameAttempt;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;

public interface GameAttemptService {

    GameAttempt startGame(StartGameRequest request);

    GameResultResponse submitGame(SubmitGameRequest request);

    Page<GameAttempt> getUserAttempts(Long userId, Pageable pageable);

    GameAttempt getAttemptById(Long attemptId);

    void cleanupStaleAttempts(LocalDateTime thresholdTime);
}
