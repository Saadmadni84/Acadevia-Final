package com.acadevia.quiz.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class CreateBulkQuestionsRequest {
    private List<CreateQuestionRequest> questions;
}
