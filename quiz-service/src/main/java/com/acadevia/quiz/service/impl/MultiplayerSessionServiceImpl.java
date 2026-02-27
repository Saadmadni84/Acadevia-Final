package com.acadevia.quiz.service.impl;

import com.acadevia.quiz.dto.request.CreateMultiplayerSessionRequest;
import com.acadevia.quiz.dto.request.JoinMultiplayerSessionRequest;
import com.acadevia.quiz.dto.response.MessageResponse;
import com.acadevia.quiz.dto.response.MultiplayerSessionResponse;
import com.acadevia.quiz.entity.MultiplayerParticipant;
import com.acadevia.quiz.entity.MultiplayerSession;
import com.acadevia.quiz.entity.Quiz;
import com.acadevia.quiz.entity.enums.SessionStatus;
import com.acadevia.quiz.exception.QuizNotFoundException;
import com.acadevia.quiz.exception.SessionFullException;
import com.acadevia.quiz.exception.SessionNotFoundException;
import com.acadevia.quiz.repository.MultiplayerParticipantRepository;
import com.acadevia.quiz.repository.MultiplayerSessionRepository;
import com.acadevia.quiz.repository.QuizRepository;
import com.acadevia.quiz.service.MultiplayerSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MultiplayerSessionServiceImpl implements MultiplayerSessionService {

    private final MultiplayerSessionRepository sessionRepository;
    private final MultiplayerParticipantRepository participantRepository;
    private final QuizRepository quizRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public MultiplayerSessionResponse createSession(CreateMultiplayerSessionRequest request, Long hostUserId) {
        Quiz quiz = quizRepository.findById(request.getQuizId())
                .orElseThrow(() -> new QuizNotFoundException("Quiz not found"));
        
        MultiplayerSession session = new MultiplayerSession();
        session.setQuizId(quiz.getId());
        session.setHostUserId(hostUserId);
        session.setSessionCode(UUID.randomUUID().toString().substring(0, 6).toUpperCase());
        session.setMode(request.getMode());
        session.setStatus(SessionStatus.WAITING);
        session.setMaxParticipants(request.getMaxParticipants());
        session.setEntryFee(request.getEntryFee());
        session.setIsPrivate(request.getIsPrivate());
        session.setCreatedAt(LocalDateTime.now());
        session.setCurrentParticipants(0);
        
        session = sessionRepository.save(session);
        
        // Add host as participant
        joinSessionInternal(session, hostUserId, "Host");
        
        return toResponse(session);
    }

    @Override
    @Transactional
    public MultiplayerSessionResponse joinSession(JoinMultiplayerSessionRequest request, Long userId) {
        MultiplayerSession session = sessionRepository.findBySessionCode(request.getJoinCode())
                .orElseThrow(() -> new SessionNotFoundException("Session not found with code: " + request.getJoinCode()));
        
        if (session.getStatus() != SessionStatus.WAITING) {
            throw new RuntimeException("Session is already started or finished");
        }
        
        if (session.getCurrentParticipants() >= session.getMaxParticipants()) {
            throw new SessionFullException("Session is full");
        }
        
        joinSessionInternal(session, userId, "Player " + userId);
        
        // Notify others
        messagingTemplate.convertAndSend("/topic/session/" + session.getSessionCode(), 
                                       new MessageResponse("User " + userId + " joined"));
        
        return toResponse(session);
    }
    
    private void joinSessionInternal(MultiplayerSession session, Long userId, String displayName) {
        if (participantRepository.existsBySessionIdAndUserId(session.getId(), userId)) {
            return; // Already joined
        }
        
        MultiplayerParticipant participant = new MultiplayerParticipant();
        participant.setSessionId(session.getId());
        participant.setUserId(userId);
        participant.setDisplayName(displayName);
        participant.setIsReady(true);
        participant.setJoinedAt(LocalDateTime.now());
        
        participantRepository.save(participant);
        
        session.setCurrentParticipants(session.getCurrentParticipants() + 1);
        sessionRepository.save(session);
    }

    @Override
    @Transactional
    public void startSession(Long sessionId, Long userId) {
        MultiplayerSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new SessionNotFoundException("Session not found"));
        
        if (!session.getHostUserId().equals(userId)) {
            throw new RuntimeException("Only host can start session");
        }
        
        session.setStatus(SessionStatus.ACTIVE);
        session.setStartTime(LocalDateTime.now());
        sessionRepository.save(session);
        
        messagingTemplate.convertAndSend("/topic/session/" + session.getSessionCode() + "/start", 
                                       new MessageResponse("Session Started"));
    }

    private MultiplayerSessionResponse toResponse(MultiplayerSession session) {
        MultiplayerSessionResponse response = new MultiplayerSessionResponse();
        response.setId(session.getId());
        response.setQuizId(session.getQuizId());
        response.setHostUserId(session.getHostUserId());
        response.setSessionCode(session.getSessionCode());
        response.setMode(session.getMode());
        response.setStatus(session.getStatus());
        response.setMaxParticipants(session.getMaxParticipants());
        response.setCurrentParticipants(session.getCurrentParticipants());
        response.setEntryFee(session.getEntryFee());
        response.setIsPrivate(session.getIsPrivate());
        response.setStartTime(session.getStartTime());
        
        return response;
    }
}
