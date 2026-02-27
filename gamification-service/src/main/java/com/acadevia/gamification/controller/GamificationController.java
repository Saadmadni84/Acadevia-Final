package com.acadevia.gamification.controller;

import com.acadevia.gamification.dto.GamificationAction;
import com.acadevia.gamification.entity.UserBadge;
import com.acadevia.gamification.entity.UserGamificationSummary;
import com.acadevia.gamification.entity.UserStreakSummary;
import com.acadevia.gamification.repository.UserBadgeRepository;
import com.acadevia.gamification.repository.UserGamificationSummaryRepository;
import com.acadevia.gamification.repository.UserStreakSummaryRepository;
import com.acadevia.gamification.service.GamificationService;
import com.acadevia.gamification.service.StreakService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/gamification")
@RequiredArgsConstructor
public class GamificationController {

    private final UserGamificationSummaryRepository summaryRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final StreakService streakService;
    private final GamificationService gamificationService;

    @GetMapping("/users/{userId}/summary")
    public ResponseEntity<UserGamificationSummary> getUserSummary(@PathVariable String userId) {
        return summaryRepository.findById(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/users/{userId}/badges")
    public ResponseEntity<List<UserBadge>> getUserBadges(@PathVariable String userId) {
        return ResponseEntity.ok(userBadgeRepository.findByUserId(userId));
    }

    @GetMapping("/users/{userId}/streak")
    public ResponseEntity<UserStreakSummary> getUserStreak(@PathVariable String userId) {
        return ResponseEntity.ok(streakService.getStreakSummary(userId));
    }

    @PostMapping("/actions")
    public ResponseEntity<Void> triggerAction(@RequestBody GamificationAction action) {
        gamificationService.processEvent(
                action.getUserId(),
                action.getActionType(),
                action.getSourceId(),
                action.getMetadata()
        );
        return ResponseEntity.accepted().build();
    }
}
