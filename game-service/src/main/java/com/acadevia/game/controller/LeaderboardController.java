package com.acadevia.game.controller;

import com.acadevia.game.dto.game.LeaderboardEntry;
import com.acadevia.game.service.LeaderboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/leaderboards")
@RequiredArgsConstructor
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    @GetMapping("/global")
    public ResponseEntity<List<LeaderboardEntry>> getGlobalLeaderboard(@RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(leaderboardService.getGlobalLeaderboard(limit));
    }

    @GetMapping("/game/{gameId}")
    public ResponseEntity<List<LeaderboardEntry>> getGameLeaderboard(@PathVariable Long gameId, @RequestParam(defaultValue = "10") int limit) {
        // Assuming current date or logic inside service handles range
        return ResponseEntity.ok(leaderboardService.getGameLeaderboard(gameId, LocalDateTime.now(), limit));
    }
    
    // Friends leaderboard endpoint omitted for now
}
