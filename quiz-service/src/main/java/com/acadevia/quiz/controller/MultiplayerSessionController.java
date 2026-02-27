package com.acadevia.quiz.controller;

import com.acadevia.quiz.dto.request.CreateMultiplayerSessionRequest;
import com.acadevia.quiz.dto.request.JoinMultiplayerSessionRequest;
import com.acadevia.quiz.dto.response.MessageResponse;
import com.acadevia.quiz.dto.response.MultiplayerSessionResponse;
import com.acadevia.quiz.service.MultiplayerSessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/multiplayer/sessions")
@RequiredArgsConstructor
public class MultiplayerSessionController {

    private final MultiplayerSessionService multiplayerService;

    @PostMapping
    public ResponseEntity<MultiplayerSessionResponse> createSession(
            @Valid @RequestBody CreateMultiplayerSessionRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        if (userId == null) userId = 1L;
        return new ResponseEntity<>(multiplayerService.createSession(request, userId), HttpStatus.CREATED);
    }
    
    @PostMapping("/join")
    public ResponseEntity<MultiplayerSessionResponse> joinSession(
            @Valid @RequestBody JoinMultiplayerSessionRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        if (userId == null) userId = 1L;
        return ResponseEntity.ok(multiplayerService.joinSession(request, userId));
    }
    
    @PostMapping("/{id}/start")
    public ResponseEntity<MessageResponse> startSession(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        if (userId == null) userId = 1L;
        multiplayerService.startSession(id, userId);
        return ResponseEntity.ok(new MessageResponse("Session started via HTTP call (WS broadcast sent)"));
    }
}
