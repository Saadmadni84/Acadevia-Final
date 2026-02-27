package com.acadevia.quiz.service;

import com.acadevia.quiz.dto.request.StartQuizRequest;
import com.acadevia.quiz.dto.request.SubmitAnswerRequest;
import com.acadevia.quiz.dto.request.SubmitQuizRequest;
import com.acadevia.quiz.dto.response.AttemptAnswerResponse;
import com.acadevia.quiz.dto.response.QuizAttemptResponse;

import java.util.List;

public interface QuizAttemptService {
    QuizAttemptResponse startQuiz(StartQuizRequest request, Long userId);
    AttemptAnswerResponse submitAnswer(SubmitAnswerRequest request, Long userId);
    QuizAttemptResponse submitQuiz(SubmitQuizRequest request, Long userId);
    QuizAttemptResponse getAttempt(Long attemptId, Long userId);
    List<AttemptAnswerResponse> getAttemptReview(Long attemptId, Long userId);
    
    // For adaptive or just navigating
    com.acadevia.quiz.dto.response.QuestionResponse getNextQuestion(Long attemptId, Long userId);
}
