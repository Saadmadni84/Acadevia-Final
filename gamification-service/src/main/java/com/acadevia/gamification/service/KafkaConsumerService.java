package com.acadevia.gamification.service;

import com.acadevia.gamification.dto.GamificationAction;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class KafkaConsumerService {

    private final GamificationService gamificationService;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "acadevia.user.login", groupId = "gamification-service-group")
    public void handleLoginEvent(String message) {
        processGenericEvent(message, "LOGIN");
    }

    @KafkaListener(topics = "acadevia.course.completion", groupId = "gamification-service-group")
    public void handleCourseCompletion(String message) {
        processGenericEvent(message, "COURSE_COMPLETE");
    }

    @KafkaListener(topics = "acadevia.quiz.attempt", groupId = "gamification-service-group")
    public void handleQuizAttempt(String message) {
        processGenericEvent(message, "QUIZ_COMPLETE");
    }

    private void processGenericEvent(String message, String defaultAction) {
        try {
            // Assuming message is JSON with userId, maybe sourceId
            // In a real scenario, map strict DTOs. 
            // Here we allow flexibility or map to GamificationAction
            GamificationAction action = objectMapper.readValue(message, GamificationAction.class);
            
            String actType = action.getActionType() != null ? action.getActionType() : defaultAction;
            
            gamificationService.processEvent(
                    action.getUserId(),
                    actType,
                    action.getSourceId(),
                    action.getMetadata()
            );
        } catch (JsonProcessingException e) {
            log.error("Error parsing kafka message: {}", message, e);
        }
    }
}
