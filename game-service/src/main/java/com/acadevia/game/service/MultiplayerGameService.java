package com.acadevia.game.service;

import com.acadevia.game.dto.response.MultiplayerGameSessionResponse;
import com.acadevia.game.dto.request.CreateMultiplayerGameRequest;
import com.acadevia.game.dto.request.JoinMultiplayerGameRequest;

public interface MultiplayerGameService {

    MultiplayerGameSessionResponse createSession(CreateMultiplayerGameRequest request);

    MultiplayerGameSessionResponse joinSession(JoinMultiplayerGameRequest request);

    void endSession(Long sessionId);

    void notifyStatusUpdate(Long sessionId, String status);

}
