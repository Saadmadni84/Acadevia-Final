package com.acadevia.leaderboard.kafka;

import com.acadevia.leaderboard.dto.event.XpAwardedEvent;
import com.acadevia.leaderboard.service.LeaderboardUpdateService;
import com.acadevia.leaderboard.util.Constants;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class LeaderboardEventListener {

    private final LeaderboardUpdateService leaderboardUpdateService;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = Constants.TOPIC_XP_AWARDED, groupId = "${spring.kafka.consumer.group-id}")
    public void onXpAwarded(ConsumerRecord<String, String> record, Acknowledgment ack) {
        try {
            String payload = record.value();
            log.debug("Received XP Event: {}", payload);
            
            XpAwardedEvent event = objectMapper.readValue(payload, XpAwardedEvent.class);
            leaderboardUpdateService.handleXpEvent(event);
            
            ack.acknowledge();
        } catch (Exception e) {
            log.error("Error processing XP event", e);
            // In a real system, send to DLT (Dead Letter Topic)
            // ack.acknowledge(); // avoid infinite loop for bad usage, or seek to next
        }
    }
}
