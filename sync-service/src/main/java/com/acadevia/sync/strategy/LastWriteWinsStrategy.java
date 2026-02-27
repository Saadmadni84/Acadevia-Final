package com.acadevia.sync.strategy;

import com.acadevia.sync.entity.SyncConflict;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class LastWriteWinsStrategy implements ConflictStrategy {

    private final ObjectMapper objectMapper;

    @Override
    public String resolve(SyncConflict conflict) {
        // In a real LWW, we compare timestamps and pick the latest write
        try {
            if (conflict.getClientPayload() == null) {
                return conflict.getServerPayload();
            }
            if (conflict.getServerPayload() == null) {
                return conflict.getClientPayload();
            }

            JsonNode clientNode = objectMapper.readTree(conflict.getClientPayload());
            JsonNode serverNode = objectMapper.readTree(conflict.getServerPayload());

            // If both have timestamps, compare them; otherwise client wins (last writer)
            long clientTs = clientNode.has("updatedAt") ? clientNode.get("updatedAt").asLong(0) : 0;
            long serverTs = serverNode.has("updatedAt") ? serverNode.get("updatedAt").asLong(0) : 0;

            if (clientTs >= serverTs) {
                return conflict.getClientPayload();
            } else {
                return conflict.getServerPayload();
            }
        } catch (Exception e) {
            log.error("LastWriteWins resolution failed for conflict {}", conflict.getId(), e);
            // Fallback to server payload
            return conflict.getServerPayload();
        }
    }
}
