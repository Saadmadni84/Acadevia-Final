package com.acadevia.sync.strategy;

import com.acadevia.sync.entity.SyncConflict;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Iterator;
import java.util.Set;

@Component
@Slf4j
@RequiredArgsConstructor
public class MergeStrategy implements ConflictStrategy {

    private final ObjectMapper objectMapper;

    @Override
    public String resolve(SyncConflict conflict) {
        try {
            JsonNode server = objectMapper.readTree(conflict.getServerPayload());
            JsonNode client = objectMapper.readTree(conflict.getClientPayload());
            
            if (server.isObject() && client.isObject()) {
                JsonNode merged = deepMerge((ObjectNode) server, (ObjectNode) client);
                return objectMapper.writeValueAsString(merged);
            }
            
            // Fallback for non-mergeable structures
            return conflict.getServerPayload();
        } catch (Exception e) {
            log.error("Merge failed for conflict {}", conflict.getId(), e);
            throw new RuntimeException("Merge failed", e);
        }
    }

    private ObjectNode deepMerge(ObjectNode server, ObjectNode client) {
        ObjectNode result = server.deepCopy();
        
        Iterator<String> fieldNames = client.fieldNames();
        while (fieldNames.hasNext()) {
            String field = fieldNames.next();
            JsonNode clientValue = client.get(field);
            JsonNode serverValue = server.get(field);

            // Simple merging rules based on common data types in LMS
            if (serverValue == null) {
                result.set(field, clientValue);
            } else if (serverValue.isNumber() && clientValue.isNumber()) {
                // MAX wins for numeric progress/score
                if (clientValue.asDouble() > serverValue.asDouble()) {
                    result.set(field, clientValue);
                }
            } else if (serverValue.isArray() && clientValue.isArray()) {
                // Union for arrays (badges, etc)
                ArrayNode union = mergeArrays((ArrayNode) serverValue, (ArrayNode) clientValue);
                result.set(field, union);
            } else if (serverValue.isObject() && clientValue.isObject()) {
                // Recursive merge
                result.set(field, deepMerge((ObjectNode) serverValue, (ObjectNode) clientValue));
            } else {
                // Default: Server wins on simple value conflicts usually, 
                // but checking timestamps if available would be better.
                // Here preserving server value (no-op)
            }
        }
        
        result.put("_merged", true);
        result.put("_mergedAt", System.currentTimeMillis());
        return result;
    }

    private ArrayNode mergeArrays(ArrayNode arr1, ArrayNode arr2) {
        Set<String> values = new HashSet<>();
        arr1.forEach(n -> values.add(n.toString()));
        arr2.forEach(n -> values.add(n.toString()));
        
        ArrayNode result = objectMapper.createArrayNode();
        // Naive re-insertion
        values.forEach(v -> {
            try {
                result.add(objectMapper.readTree(v));
            } catch (Exception ignored) {}
        });
        return result;
    }
}
