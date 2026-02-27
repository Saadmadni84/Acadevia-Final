package com.acadevia.quiz.service;

import com.acadevia.quiz.dto.response.QuizResponse;

public interface DailyChallengeService {
    QuizResponse getDailyChallenge(Long userId, String subject, Integer classGrade);
}
