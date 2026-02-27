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
public class PopQuestionAnswerResponse {

    private Long id;
    private Long popQuestionId;
    private Long userId;
    private String selectedAnswer;
    private Boolean isCorrect;
    private Integer timeTakenSec;
    private Integer xpEarned;
    private Integer attemptNumber;
    private LocalDateTime answeredAt;
}
