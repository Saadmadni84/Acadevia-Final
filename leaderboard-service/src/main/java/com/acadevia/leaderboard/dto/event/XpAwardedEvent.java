package com.acadevia.leaderboard.dto.event;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class XpAwardedEvent {

    private String eventId;
    private String userId;
    private String activityId;
    private String subject; // MATH, SCIENCE
    private int xpAmount;
    private LocalDateTime timestamp;

    // Context for geographical/organizational aggregation
    private String schoolId;
    private String userGrade; // "10", "12"
    private String countryCode;
    private String state;
    private String city;

    // Optional metadata
    private Map<String, Object> metadata;
}
