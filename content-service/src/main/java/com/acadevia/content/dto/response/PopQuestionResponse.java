package com.acadevia.content.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PopQuestionResponse {

    private Long id;
    private Long videoId;
    private Integer timestampSec;
    private String questionText;
    private String questionType;
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;
    private String correctAnswer;
    private String explanation;
    private String hint;
    private Integer xpReward;
    private String languageCode;
    private String topic;
    private String concept;
    private String difficulty;
    private Integer sequenceOrder;
    private Boolean isMandatory;
    private Boolean pauseVideo;
    private Integer timeLimitSec;
    private Boolean allowSkip;
    private Boolean showExplanation;
    private Integer totalAttempts;
    private Integer correctAttempts;
    private Double accuracyRate;
    private Double avgTimeTakenSec;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
