package com.acadevia.quiz.service;

import com.acadevia.quiz.entity.Question;

public interface UserAnalyticsService {
    void updateTopicAccuracy(Long userId, Question question, boolean isCorrect);
    void updateUserXP(Long userId, int xpToAdd);
}
