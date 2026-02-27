package com.acadevia.game.service.impl;

import com.acadevia.game.dto.response.MultiplayerGameSessionResponse;
import com.acadevia.game.dto.request.CreateMultiplayerGameRequest;
import com.acadevia.game.dto.request.JoinMultiplayerGameRequest;
import com.acadevia.game.entity.MultiplayerGamePlayer;
import com.acadevia.game.entity.MultiplayerGameSession;
import com.acadevia.game.entity.enums.GameSessionStatus;
import com.acadevia.game.exception.ResourceNotFoundException;
import com.acadevia.game.repository.GameRepository;
import com.acadevia.game.repository.MultiplayerGamePlayerRepository;
import com.acadevia.game.repository.MultiplayerGameSessionRepository;
import com.acadevia.game.service.MultiplayerGameService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class MultiplayerGameServiceImpl implements MultiplayerGameService {

    private final MultiplayerGameSessionRepository sessionRepository;
    private final MultiplayerGamePlayerRepository playerRepository;
    private final GameRepository gameRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public MultiplayerGameSessionResponse createSession(CreateMultiplayerGameRequest request) {
        Long userId = getCurrentUserId();
        MultiplayerGameSession session = new MultiplayerGameSession();
        session.setGame(gameRepository.findById(request.getGameId())
                .orElseThrow(() -> new ResourceNotFoundException("Game not found")));
        session.setHostUserId(userId);
        session.setStatus(GameSessionStatus.WAITING);
        session.setCreatedAt(LocalDateTime.now());
        session.setSessionCode(UUID.randomUUID().toString().substring(0, 6).toUpperCase());
        session.setMaxPlayers(request.getMaxPlayers() != null ? request.getMaxPlayers() : 2);
        
        session = sessionRepository.save(session);
        
        // Add host as player
        joinSessionInternal(session, userId);
        
        return mapToResponse(session);
    }

    @Override
    @Transactional
    public MultiplayerGameSessionResponse joinSession(JoinMultiplayerGameRequest request) {
        Long userId = getCurrentUserId();
        MultiplayerGameSession session = sessionRepository.findBySessionCode(request.getSessionCode())
                .orElseThrow(() -> new ResourceNotFoundException("Session not found"));
        
        if (session.getStatus() != GameSessionStatus.WAITING) {
            throw new IllegalStateException("Session is not accepting players");
        }
        
        joinSessionInternal(session, userId);
        
        MultiplayerGameSessionResponse response = mapToResponse(session);
        notifyStatusUpdate(session.getId(), "PLAYER_JOINED");
        return response;
    }
    
    private void joinSessionInternal(MultiplayerGameSession session, Long userId) {
        if (playerRepository.findBySessionIdAndUserId(session.getId(), userId).isPresent()) {
            return;
        }
        
        MultiplayerGamePlayer player = new MultiplayerGamePlayer();
        player.setSession(session);
        player.setUserId(userId);
        player.setIsConnected(true);
        player.setJoinedAt(LocalDateTime.now());
        player.setScore(0);
        playerRepository.save(player);
    }

    @Override
    @Transactional
    public void endSession(Long sessionId) {
        MultiplayerGameSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found"));
        
        session.setStatus(GameSessionStatus.COMPLETED);
        session.setEndedAt(LocalDateTime.now());
        sessionRepository.save(session);
        
        notifyStatusUpdate(sessionId, "SESSION_ENDED");
    }

    @Override
    public void notifyStatusUpdate(Long sessionId, String status) {
        messagingTemplate.convertAndSend("/topic/game/" + sessionId, status);
    }
    
    private MultiplayerGameSessionResponse mapToResponse(MultiplayerGameSession session) {
        MultiplayerGameSessionResponse response = new MultiplayerGameSessionResponse();
        response.setSessionCode(session.getSessionCode());
        response.setGameId(session.getGame().getId());
        response.setHostUserId(session.getHostUserId());
        response.setStatus(session.getStatus().name());
        response.setMaxPlayers(session.getMaxPlayers());
        response.setCurrentPlayers(session.getCurrentPlayers());
        return response;
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return 1L;
        }
        try {
            return Long.parseLong(authentication.getName());
        } catch (NumberFormatException e) {
            return 1L;
        }
    }
}
