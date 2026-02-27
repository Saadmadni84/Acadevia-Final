package com.acadevia.game.controller;

import com.acadevia.game.dto.response.GameDetailResponse;
import com.acadevia.game.dto.response.GameResponse;
import com.acadevia.game.dto.game.GameSearchCriteria;
import com.acadevia.game.dto.request.CreateGameRequest;
import com.acadevia.game.service.GameService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/games")
@RequiredArgsConstructor
public class GameController {

    private final GameService gameService;

    @PostMapping
    public ResponseEntity<GameResponse> createGame(@Valid @RequestBody CreateGameRequest request) {
        return new ResponseEntity<>(gameService.createGame(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<GameResponse> updateGame(@PathVariable Long id, @Valid @RequestBody CreateGameRequest request) {
        return ResponseEntity.ok(gameService.updateGame(id, request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GameDetailResponse> getGameById(@PathVariable Long id) {
        return ResponseEntity.ok(gameService.getGameById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGame(@PathVariable Long id) {
        gameService.deleteGame(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<Page<GameResponse>> searchGames(GameSearchCriteria criteria, Pageable pageable) {
        return ResponseEntity.ok(gameService.searchGames(criteria, pageable));
    }

    @GetMapping("/concept/{conceptId}")
    public ResponseEntity<List<GameResponse>> getGamesByConcept(@PathVariable Long conceptId) {
        return ResponseEntity.ok(gameService.getGamesByConcept(conceptId));
    }

    @GetMapping("/trending")
    public ResponseEntity<List<GameResponse>> getTrendingGames() {
        return ResponseEntity.ok(gameService.getTrendingGames());
    }

    @GetMapping("/new")
    public ResponseEntity<List<GameResponse>> getNewReleases() {
        return ResponseEntity.ok(gameService.getNewReleases());
    }
}
