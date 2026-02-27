package com.acadevia.course.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateLessonRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Content type is required")
    private String contentType; // VIDEO, TEXT, PDF, INTERACTIVE, QUIZ_LINK, GAME_LINK, ASSIGNMENT

    private String contentUrl; // required for VIDEO, PDF

    private String contentText; // required for TEXT

    private Long videoId; // optional, links to content-service

    private Long quizId; // optional, links to quiz-service

    private Long gameId; // optional, links to game-service

    private Integer durationMinutes;

    private Integer sequenceOrder; // optional, auto-calculated

    @Builder.Default
    private Integer xpReward = 10;

    @Builder.Default
    private Boolean isFreePreview = false;

    @Builder.Default
    private Boolean isMandatory = true;

    private String language;

    private List<String> attachmentUrls;
}
