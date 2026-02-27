package com.acadevia.auth.service;

import com.acadevia.auth.dto.event.PasswordResetEvent;
import com.acadevia.auth.dto.event.UserLoggedInEvent;
import com.acadevia.auth.dto.event.UserRegisteredEvent;
import com.acadevia.auth.util.AppConstants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.KafkaException;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
public class KafkaEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(KafkaEventPublisher.class);
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publishUserRegistered(UserRegisteredEvent event) {
        String key = event.getUserId().toString();
        log.info("Publishing user.registered event for userId: {}", key);
        publish(AppConstants.KAFKA_TOPIC_USER_REGISTERED, key, event);
    }

    public void publishUserLoggedIn(UserLoggedInEvent event) {
        String key = event.getUserId().toString();
        log.info("Publishing user.logged-in event for userId: {}", key);
        publish(AppConstants.KAFKA_TOPIC_USER_LOGGED_IN, key, event);
    }

    public void publishPasswordReset(PasswordResetEvent event) {
        String key = event.getUserId().toString();
        log.info("Publishing user.password-reset event for userId: {}", key);
        publish(AppConstants.KAFKA_TOPIC_PASSWORD_RESET, key, event);
    }

    private void publish(String topic, String key, Object event) {
        try {
            CompletableFuture<SendResult<String, Object>> future = kafkaTemplate.send(topic, key, event);
            future.whenComplete((result, ex) -> {
                if (ex == null) {
                    log.debug("Sent event to topic: {} with offset: {}", topic, result.getRecordMetadata().offset());
                } else {
                    log.error("Unable to send event to topic: {} due to : {}", topic, ex.getMessage());
                }
            });
        } catch (KafkaException e) {
            log.error("Error publishing to Kafka", e);
            // We catch but don't rethrow to avoid failing the main transaction if analytics/messaging is down
        }
    }
}
