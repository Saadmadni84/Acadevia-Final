package com.acadevia.game.controller;

import com.acadevia.game.dto.response.MultiplayerGameSessionResponse;
import com.acadevia.game.dto.request.CreateMultiplayerGameRequest;
import com.acadevia.game.dto.request.JoinMultiplayerGameRequest;
import com.acadevia.game.service.MultiplayerGameService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/multiplayer")
@RequiredArgsConstructor
public class MultiplayerGameController {

    private final MultiplayerGameService multiplayerService;

    @PostMapping("/create")
    public ResponseEntity<MultiplayerGameSessionResponse> createSession(@Valid @RequestBody CreateMultiplayerGameRequest request) {
        return new ResponseEntity<>(multiplayerService.createSession(request), HttpStatus.CREATED);
    }

    @PostMapping("/join")
    public ResponseEntity<MultiplayerGameSessionResponse> joinSession(@Valid @RequestBody JoinMultiplayerGameRequest request) {
        return ResponseEntity.ok(multiplayerService.joinSession(request));
    }

    @PostMapping("/{sessionId}/end")
    public ResponseEntity<Void> endSession(@PathVariable Long sessionId) {
        multiplayerService.endSession(sessionId);
        return ResponseEntity.noContent().build();
    }
}
