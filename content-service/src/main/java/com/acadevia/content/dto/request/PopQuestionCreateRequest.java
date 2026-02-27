package com.acadevia.content.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PopQuestionCreateRequest {

    @NotNull(message = "Video ID is required")
    private Long videoId;

    @NotNull(message = "Timestamp is required")
    @Min(value = 0, message = "Timestamp must be non-negative")
    private Integer timestampSec;

    @NotBlank(message = "Question text is required")
    private String questionText;

    @Builder.Default
    private String questionType = "MCQ";

    @Size(max = 500)
    private String optionA;

    @Size(max = 500)
    private String optionB;

    @Size(max = 500)
    private String optionC;

    @Size(max = 500)
    private String optionD;

    @NotBlank(message = "Correct answer is required")
    @Size(max = 500)
    private String correctAnswer;

    private String explanation;

    private String hint;

    @Builder.Default
    private Integer xpReward = 5;

    @Builder.Default
    private String languageCode = "en";

    @Size(max = 100)
    private String topic;

    @Size(max = 200)
    private String concept;

    @Builder.Default
    private String difficulty = "MEDIUM";

    @NotNull(message = "Sequence order is required")
    private Integer sequenceOrder;

    @Builder.Default
    private Boolean isMandatory = false;

    @Builder.Default
    private Boolean pauseVideo = true;

    @Builder.Default
    private Integer timeLimitSec = 30;

    @Builder.Default
    private Boolean allowSkip = true;

    @Builder.Default
    private Boolean showExplanation = true;
}
