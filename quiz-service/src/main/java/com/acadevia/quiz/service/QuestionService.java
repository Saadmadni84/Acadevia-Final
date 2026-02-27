package com.acadevia.quiz.service;

import com.acadevia.quiz.dto.request.CreateBulkQuestionsRequest;
import com.acadevia.quiz.dto.request.CreateQuestionRequest;
import com.acadevia.quiz.dto.request.UpdateQuestionRequest;
import com.acadevia.quiz.dto.response.PagedResponse;
import com.acadevia.quiz.dto.response.QuestionResponse;
import com.acadevia.quiz.entity.enums.QuestionType;

import java.util.List;

public interface QuestionService {
    QuestionResponse createQuestion(Long quizId, CreateQuestionRequest request);
    List<QuestionResponse> createBulkQuestions(Long quizId, CreateBulkQuestionsRequest request);
    QuestionResponse updateQuestion(Long questionId, UpdateQuestionRequest request);
    QuestionResponse getQuestionById(Long questionId);
    void deleteQuestion(Long questionId);
    
    List<QuestionResponse> getQuestionsByQuizId(Long quizId);
    PagedResponse<QuestionResponse> getQuestionsByQuizId(Long quizId, int page, int size);
    
    // Bank operations
    PagedResponse<QuestionResponse> getQuestionsFromBank(String subject, String topic, QuestionType type, int page, int size);
}
