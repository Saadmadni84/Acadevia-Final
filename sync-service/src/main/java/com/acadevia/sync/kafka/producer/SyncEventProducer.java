package com.acadevia.sync.kafka.producer;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class SyncEventProducer {

    private final KafkaTemplate<String, String> kafkaTemplate;

    public void publishSyncCompleted(Long userId, String deviceId, String batchId) {
        // In real app, serialize a proper event object.
        String payload = String.format("{\"userId\": %d, \"deviceId\": \"%s\", \"batchId\": \"%s\", \"status\": \"COMPLETED\"}", userId, deviceId, batchId);
        kafkaTemplate.send("sync.completed", userId.toString(), payload);
    }

    public void publishItemReceived(String entityId, String entityType) {
        // ...
    }
}
