package com.acadevia.content.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PopQuestionDetailResponse {

    private PopQuestionResponse question;
    private List<PopQuestionAnswerResponse> userResponses;
    private PopQuestionDetailResult result;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PopQuestionDetailResult {
        private Integer totalAttempts;
        private Integer correctAttempts;
        private Double accuracyRate;
        private Double avgTimeTaken;
        private Integer totalXpEarned;
        private Boolean lastAttemptCorrect;
    }
}
