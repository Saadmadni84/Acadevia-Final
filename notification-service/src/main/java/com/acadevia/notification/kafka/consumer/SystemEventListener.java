package com.acadevia.notification.kafka.consumer;

import com.acadevia.notification.enums.NotificationCategory;
import com.acadevia.notification.enums.NotificationPriority;
import com.acadevia.notification.service.NotificationDispatcher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@Slf4j
@RequiredArgsConstructor
public class SystemEventListener {

    private final NotificationDispatcher notificationDispatcher;

    @KafkaListener(topics = "system.marketing", groupId = "notification-group")
    public void handleMarketingEvent(Map<String, Object> payload) {
        log.info("Received System Marketing Event");
        // Simplified generic listener for map payloads if needed
    }
}
