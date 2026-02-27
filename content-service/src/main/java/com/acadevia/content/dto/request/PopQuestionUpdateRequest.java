package com.acadevia.content.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PopQuestionUpdateRequest {

    @Min(value = 0, message = "Timestamp must be non-negative")
    private Integer timestampSec;

    private String questionText;

    private String questionType;

    @Size(max = 500)
    private String optionA;

    @Size(max = 500)
    private String optionB;

    @Size(max = 500)
    private String optionC;

    @Size(max = 500)
    private String optionD;

    @Size(max = 500)
    private String correctAnswer;

    private String explanation;

    private String hint;

    private Integer xpReward;

    private String languageCode;

    @Size(max = 100)
    private String topic;

    @Size(max = 200)
    private String concept;

    private String difficulty;

    private Integer sequenceOrder;

    private Boolean isMandatory;

    private Boolean pauseVideo;

    private Integer timeLimitSec;

    private Boolean allowSkip;

    private Boolean showExplanation;

    private Boolean isActive;
}
