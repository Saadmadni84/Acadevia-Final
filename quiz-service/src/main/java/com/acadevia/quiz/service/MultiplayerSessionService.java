package com.acadevia.quiz.service;

import com.acadevia.quiz.dto.request.CreateMultiplayerSessionRequest;
import com.acadevia.quiz.dto.request.JoinMultiplayerSessionRequest;
import com.acadevia.quiz.dto.response.MultiplayerSessionResponse;

public interface MultiplayerSessionService {
    MultiplayerSessionResponse createSession(CreateMultiplayerSessionRequest request, Long hostUserId);
    MultiplayerSessionResponse joinSession(JoinMultiplayerSessionRequest request, Long userId);
    void startSession(Long sessionId, Long userId);
}
