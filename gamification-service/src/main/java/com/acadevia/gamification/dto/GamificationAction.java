package com.acadevia.gamification.dto;

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
public class GamificationAction {
    private String userId;
    private String actionType; // e.g. 'COURSE_COMPLETE', 'QUIZ_SCORE'
    private String sourceId;
    private Map<String, Object> metadata;
    private LocalDateTime timestamp;
}
