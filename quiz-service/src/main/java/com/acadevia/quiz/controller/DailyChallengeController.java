package com.acadevia.quiz.controller;

import com.acadevia.quiz.dto.response.QuizResponse;
import com.acadevia.quiz.service.DailyChallengeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/daily-challenges")
@RequiredArgsConstructor
public class DailyChallengeController {

    private final DailyChallengeService dailyChallengeService;

    @GetMapping
    public ResponseEntity<QuizResponse> getDailyChallenge(
            @RequestParam String subject,
            @RequestParam Integer classGrade,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        if (userId == null) userId = 1L;
        return ResponseEntity.ok(dailyChallengeService.getDailyChallenge(userId, subject, classGrade));
    }
}
