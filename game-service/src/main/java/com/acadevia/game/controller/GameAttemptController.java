package com.acadevia.game.controller;

import com.acadevia.game.dto.request.StartGameRequest;
import com.acadevia.game.dto.request.SubmitGameRequest;
import com.acadevia.game.dto.response.GameResultResponse;
import com.acadevia.game.entity.GameAttempt;
import com.acadevia.game.service.GameAttemptService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/attempts")
@RequiredArgsConstructor
public class GameAttemptController {

    private final GameAttemptService attemptService;

    @PostMapping("/start")
    public ResponseEntity<GameAttempt> startGame(@Valid @RequestBody StartGameRequest request) {
        return new ResponseEntity<>(attemptService.startGame(request), HttpStatus.CREATED);
    }

    @PostMapping("/submit")
    public ResponseEntity<GameResultResponse> submitGame(@Valid @RequestBody SubmitGameRequest request) {
        return new ResponseEntity<>(attemptService.submitGame(request), HttpStatus.OK);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<GameAttempt>> getUserAttempts(@PathVariable Long userId, Pageable pageable) {
        return ResponseEntity.ok(attemptService.getUserAttempts(userId, pageable));
    }

    @GetMapping("/{attemptId}")
    public ResponseEntity<GameAttempt> getAttemptById(@PathVariable Long attemptId) {
        return ResponseEntity.ok(attemptService.getAttemptById(attemptId));
    }
}
