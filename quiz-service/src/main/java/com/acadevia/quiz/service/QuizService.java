package com.acadevia.quiz.service;

import com.acadevia.quiz.dto.request.CreateQuizRequest;
import com.acadevia.quiz.dto.request.UpdateQuizRequest;
import com.acadevia.quiz.dto.response.PagedResponse;
import com.acadevia.quiz.dto.response.QuizResponse;

public interface QuizService {
    QuizResponse createQuiz(CreateQuizRequest request, Long userId);
    QuizResponse updateQuiz(Long quizId, UpdateQuizRequest request, Long userId);
    QuizResponse getQuizById(Long quizId);
    PagedResponse<QuizResponse> getAllQuizzes(int page, int size, String sortBy, String sortDir);
    void deleteQuiz(Long quizId, Long userId);
    void publishQuiz(Long quizId, Long userId);
    
    // Additional methods based on filters
    PagedResponse<QuizResponse> getQuizzesByCourseId(Long courseId, int page, int size);
    PagedResponse<QuizResponse> getQuizzesByCreator(Long userId, int page, int size);
}
