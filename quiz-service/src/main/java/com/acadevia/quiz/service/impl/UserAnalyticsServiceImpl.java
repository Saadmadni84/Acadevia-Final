package com.acadevia.quiz.service.impl;

import com.acadevia.quiz.entity.Question;
import com.acadevia.quiz.entity.UserTopicAccuracy;
import com.acadevia.quiz.entity.enums.MasteryLevel;
import com.acadevia.quiz.repository.UserTopicAccuracyRepository;
import com.acadevia.quiz.service.UserAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserAnalyticsServiceImpl implements UserAnalyticsService {

    private final UserTopicAccuracyRepository accuracyRepository;

    @Override
    @Transactional
    public void updateTopicAccuracy(Long userId, Question question, boolean isCorrect) {
        if (question.getTopic() == null || question.getTopic().isEmpty()) return;
        
        Integer classGrade = question.getClassGrade() != null ? question.getClassGrade() : 0;
        
        com.acadevia.quiz.entity.UserTopicAccuracy accuracy = accuracyRepository.findByUserIdAndSubjectAndTopicAndClassGrade(
                userId, question.getSubject(), question.getTopic(), classGrade)
                .orElse(com.acadevia.quiz.entity.UserTopicAccuracy.builder()
                        .userId(userId)
                        .topic(question.getTopic())
                        .subject(question.getSubject())
                        .classGrade(classGrade)
                        .totalQuestions(0)
                        .correctAnswers(0)
                        .accuracyPercentage(0.0)
                        .masteryLevel(MasteryLevel.NOVICE)
                        .masteryScore(0.0)
                        .build());
        
        accuracy.setTotalQuestions(accuracy.getTotalQuestions() + 1);
        if (isCorrect) {
            accuracy.setCorrectAnswers(accuracy.getCorrectAnswers() + 1);
        }
        
        // Recalculate accuracy
        double newAccuracy = ((double) accuracy.getCorrectAnswers() / accuracy.getTotalQuestions()) * 100;
        accuracy.setAccuracyPercentage(newAccuracy);
        
        // Update mastery logic
        if (newAccuracy > 90.0) accuracy.setMasteryLevel(MasteryLevel.EXPERT);
        else if (newAccuracy > 70.0) accuracy.setMasteryLevel(MasteryLevel.ADVANCED);
        else if (newAccuracy > 40.0) accuracy.setMasteryLevel(MasteryLevel.INTERMEDIATE);
        else accuracy.setMasteryLevel(MasteryLevel.NOVICE); // Assuming BEGINNER mapped to NOVICE or check enum
        
        accuracyRepository.save(accuracy);
    }

    @Override
    public void updateUserXP(Long userId, int xpToAdd) {
        // This would typically involve communication with Gamification Service or User Service via messaging
        // Implementation: kafkaTemplate.send("user-xp-update", new XpEvent(userId, xpToAdd));
        // For now, no-op or log
    }
}
