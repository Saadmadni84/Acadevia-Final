package com.acadevia.leaderboard.controller;

import com.acadevia.leaderboard.dto.response.LeaderboardResponse;
import com.acadevia.leaderboard.enums.GeoScope;
import com.acadevia.leaderboard.enums.SubjectScope;
import com.acadevia.leaderboard.enums.TimeScope;
import com.acadevia.leaderboard.service.LeaderboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/leaderboards")
@RequiredArgsConstructor
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    @GetMapping
    public ResponseEntity<LeaderboardResponse> getLeaderboard(
            @RequestParam(defaultValue = "WEEKLY") TimeScope timeScope,
            @RequestParam(defaultValue = "GLOBAL") GeoScope geoScope,
            @RequestParam(defaultValue = "world") String scopeValue,
            @RequestParam(required = false) SubjectScope subject,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestHeader(name = "X-User-Id", required = false) String requestingUserId) {

        LeaderboardResponse response = leaderboardService.getLeaderboard(
                timeScope, geoScope, scopeValue, subject, page, size, requestingUserId);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/global")
    public ResponseEntity<LeaderboardResponse> getGlobalLeaderboard(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(leaderboardService.getGlobalLeaderboard(page, size));
    }
}
