package com.acadevia.content.dto.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PopQuestionAnsweredEvent {

    private Long questionId;
    private Long videoId;
    private Long userId;
    private Long lessonId;
    private Long courseId;
    private String selectedAnswer;
    private Boolean isCorrect;
    private Integer xpEarned;
    private Integer timeTakenSec;
    private Integer attemptNumber;
    private String questionType;
    private String difficulty;
    private String topic;
    private LocalDateTime answeredAt;
    private String eventType;

    @Builder.Default
    private String source = "content-service";
}
