package com.acadevia.notification.util;

import com.acadevia.notification.dto.response.NotificationResponse;
import com.acadevia.notification.entity.Notification;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.experimental.UtilityClass;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;

@UtilityClass
public class NotificationUtils {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static NotificationResponse toResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .recipientId(notification.getUserId())
                .subject(notification.getTitle())
                .content(notification.getMessage())
                .category(notification.getCategory())
                .priority(notification.getPriority())
                .read(notification.isRead())
                .link(notification.getActionUrl())
                // .iconUrl(notification.getIconUrl()) // Response DTO doesn't have iconUrl
                .metadata(parseMetadata(notification.getMetadataJson()))
                // .timeAgo(...) Response DTO doesn't have timeAgo
                .createdAt(notification.getCreatedAt())
                .readAt(notification.getReadAt())
                .build();
    }

    public static String convertMetadataToJson(Map<String, Object> metadata) {
        if (metadata == null) return null;
        try {
            return objectMapper.writeValueAsString(metadata);
        } catch (Exception e) {
            return null;
        }
    }

    public static Map<String, Object> parseMetadata(String json) {
        if (json == null) return null;
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            return null;
        }
    }

    public static String calculateTimeAgo(LocalDateTime dateTime) {
        if (dateTime == null) return "";

        Duration duration = Duration.between(dateTime, LocalDateTime.now());
        long seconds = duration.getSeconds();

        if (seconds < 60) return "Just now";
        if (seconds < 3600) return (seconds / 60) + "m ago";
        if (seconds < 86400) return (seconds / 3600) + "h ago";
        if (seconds < 604800) return (seconds / 86400) + "d ago";
        if (seconds < 2592000) return (seconds / 604800) + "w ago";
        return (seconds / 2592000) + "mo ago";
    }
}
