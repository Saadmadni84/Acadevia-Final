package com.acadevia.quiz.service.impl;

import com.acadevia.quiz.dto.request.StartQuizRequest;
import com.acadevia.quiz.dto.request.SubmitAnswerRequest;
import com.acadevia.quiz.dto.request.SubmitQuizRequest;
import com.acadevia.quiz.dto.response.AttemptAnswerResponse;
import com.acadevia.quiz.dto.response.QuestionResponse;
import com.acadevia.quiz.dto.response.QuizAttemptResponse;
import com.acadevia.quiz.engine.AdaptiveEngine;
import com.acadevia.quiz.engine.QuestionSelector;
import com.acadevia.quiz.engine.XPMultiplierCalculator;
import com.acadevia.quiz.entity.AttemptAnswer;
import com.acadevia.quiz.entity.Question;
import com.acadevia.quiz.entity.Quiz;
import com.acadevia.quiz.entity.QuizAttempt;
import com.acadevia.quiz.entity.enums.AttemptStatus;
import com.acadevia.quiz.entity.enums.DifficultyLevel;
import com.acadevia.quiz.entity.enums.QuestionType;
import com.acadevia.quiz.entity.enums.QuizMode;
import com.acadevia.quiz.exception.AttemptNotFoundException;
import com.acadevia.quiz.exception.MaxAttemptsExceededException;
import com.acadevia.quiz.exception.QuestionNotFoundException;
import com.acadevia.quiz.exception.QuizNotFoundException;
import com.acadevia.quiz.mapper.QuizMapper;
import com.acadevia.quiz.repository.AttemptAnswerRepository;
import com.acadevia.quiz.repository.QuestionRepository;
import com.acadevia.quiz.repository.QuizAttemptRepository;
import com.acadevia.quiz.repository.QuizRepository;
import com.acadevia.quiz.service.QuizAttemptService;
import com.acadevia.quiz.service.UserAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuizAttemptServiceImpl implements QuizAttemptService {

    private final QuizRepository quizRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final AttemptAnswerRepository attemptAnswerRepository;
    private final QuestionRepository questionRepository;
    private final QuizMapper quizMapper;
    
    private final AdaptiveEngine adaptiveEngine;
    private final QuestionSelector questionSelector;
    private final XPMultiplierCalculator xpCalculator;
    private final UserAnalyticsService analyticsService;

    @Override
    @Transactional
    public QuizAttemptResponse startQuiz(StartQuizRequest request, Long userId) {
        Quiz quiz = quizRepository.findById(request.getQuizId())
                .orElseThrow(() -> new QuizNotFoundException("Quiz not found"));
        
        // Validate max attempts
        if (quiz.getMaxAttempts() != null && quiz.getMaxAttempts() > 0) {
            int attempts = quizAttemptRepository.countByQuizIdAndUserId(request.getQuizId(), userId);
            if (attempts >= quiz.getMaxAttempts()) {
                throw new MaxAttemptsExceededException("Max attempts reached for this quiz");
            }
        }
        
        QuizAttempt attempt = new QuizAttempt();
        attempt.setQuiz(quiz);
        attempt.setQuizId(quiz.getId()); // Redundant but safe
        attempt.setUserId(userId);
        attempt.setStartedAt(LocalDateTime.now());
        attempt.setStatus(AttemptStatus.IN_PROGRESS);
        attempt.setQuizMode(request.getQuizMode());
        
        // Initialize scores
        attempt.setScore(0);
        attempt.setCorrectAnswers(0);
        attempt.setWrongAnswers(0);
        attempt.setSkippedAnswers(0);
        attempt.setXpEarned(0);
        
        QuizAttempt savedAttempt = quizAttemptRepository.save(attempt);
        
        // If Standard Mode, we rely on implicit question list (by quizId)
        // If Adaptive Mode, we pick first question now? 
        // Or wait for getNextQuestion call. Let's wait for getNextQuestion to keep start fast.
        
        return quizMapper.toResponse(savedAttempt);
    }

    @Override
    @Transactional
    public AttemptAnswerResponse submitAnswer(SubmitAnswerRequest request, Long userId) {
        QuizAttempt attempt = quizAttemptRepository.findById(request.getQuizAttemptId())
                .orElseThrow(() -> new AttemptNotFoundException("Attempt not found"));
        
        if (!attempt.getUserId().equals(userId)) {
             throw new RuntimeException("Unauthorized attempt access");
        }
        
        if (attempt.getStatus() != AttemptStatus.IN_PROGRESS) {
            throw new RuntimeException("Quiz attempt is already completed or paused");
        }
        
        Question question = questionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new QuestionNotFoundException("Question not found"));
        
        // Check if answer already exists (prevent double submission)
        // logic omitted for brevity
        
        boolean isCorrect = false;
        // Simple logic for single choice
        if (question.getCorrectAnswer() != null && request.getSelectedOption() != null) {
            isCorrect = question.getCorrectAnswer().equalsIgnoreCase(request.getSelectedOption());
        }
        // Logic for multiple choice
        if (question.getCorrectOptions() != null && request.getSelectedOptions() != null) {
             // simplified exact match
             isCorrect = question.getCorrectOptions().containsAll(request.getSelectedOptions()) 
                         && request.getSelectedOptions().containsAll(question.getCorrectOptions());
        }
        
        AttemptAnswer answer = new AttemptAnswer();
        answer.setAttemptId(attempt.getId());
        answer.setQuestionId(question.getId());
        answer.setQuizId(attempt.getQuizId());
        answer.setUserId(userId);
        
        answer.setSelectedAnswer(request.getSelectedOption());
        answer.setSelectedOptions(request.getSelectedOptions());
        answer.setIsCorrect(isCorrect);
        answer.setTimeTakenSeconds(request.getTimeTakenSec());
        answer.setIsMarkedReview(request.getIsMarkedForReview());
        answer.setIsSkipped(request.getIsSkipped());
        
        // Calculate marks
        int marks = 0;
        if (isCorrect) {
            marks = (question.getMarks() != null) ? question.getMarks() : 1;
        } else if (Boolean.TRUE.equals(attempt.getQuiz().getNegativeMarking())) {
             // handle negative marking
        }
        answer.setMarksAwarded(java.math.BigDecimal.valueOf(marks));
        
        attemptAnswerRepository.save(answer);
        
        // Update attempt stats immediately or at end?
        // Updating immediately allows live dashboard
        if (isCorrect) {
            attempt.setScore(attempt.getScore() + marks);
            attempt.setCorrectAnswers(attempt.getCorrectAnswers() + 1);
            
            // Calculate XP
            int xp = xpCalculator.calculateXP(true, 
                        question.getXpValue() != null ? question.getXpValue() : 10,
                        request.getTimeTakenSec(), 
                        question.getTimeExpectedSec() != null ? question.getTimeExpectedSec() : 60, 
                        false, 0, // Streak logic needs history
                        question.getDifficultyLevel() != null ? question.getDifficultyLevel().name() : "MEDIUM");
            attempt.setXpEarned(attempt.getXpEarned() + xp);
            analyticsService.updateUserXP(userId, xp);
        } else {
            attempt.setWrongAnswers(attempt.getWrongAnswers() + 1);
        }
        
        analyticsService.updateTopicAccuracy(userId, question, isCorrect);
        
        quizAttemptRepository.save(attempt);
        
        return quizMapper.toResponse(answer);
    }
    
    @Override
    @Transactional
    public QuestionResponse getNextQuestion(Long attemptId, Long userId) {
        QuizAttempt attempt = quizAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new AttemptNotFoundException("Attempt not found"));

        List<AttemptAnswer> answered = attemptAnswerRepository.findByAttemptId(attemptId);
        List<Long> answeredIds = answered.stream()
                .map(AttemptAnswer::getQuestionId)
                .collect(Collectors.toList());
        
        if (attempt.getQuizMode() == QuizMode.ADAPTIVE) {
             // Basic Adaptive Logic
             DifficultyLevel currentDiff = DifficultyLevel.MEDIUM;
             if (!answered.isEmpty()) {
                 AttemptAnswer last = answered.get(answered.size() - 1);
                 // Determine next difficulty
                 currentDiff = adaptiveEngine.getNextDifficulty(
                         last.getQuestion().getDifficultyLevel(), 
                         last.getIsCorrect(), 
                         last.getTimeTakenSeconds(), 
                         60); // Default expected time if null
             }
             
             List<Question> candidates = questionSelector.selectCandidateQuestions(
                     attempt.getQuiz().getSubject(), 
                     attempt.getQuiz().getTopic(), 
                     currentDiff);
             
             Question next = adaptiveEngine.selectNextQuestion(candidates, answeredIds);
             return (next != null) ? quizMapper.toResponse(next) : null;
             
        } else {
             // Standard Mode: Fetch linked questions
             List<Question> allQuestions = questionRepository.findByQuizIdOrderBySequenceOrderAsc(attempt.getQuiz().getId());
             // Filter answered
             // This is inefficient for large lists but safe for quiz < 100 Qs
             for (Question q : allQuestions) {
                 if (!answeredIds.contains(q.getId())) {
                     return quizMapper.toResponse(q);
                 }
             }
             return null; // No more questions
        }
    }

    @Override
    @Transactional
    public QuizAttemptResponse submitQuiz(SubmitQuizRequest request, Long userId) {
        QuizAttempt attempt = quizAttemptRepository.findById(request.getQuizAttemptId())
                .orElseThrow(() -> new AttemptNotFoundException("Attempt not found"));
        
        attempt.setCompletedAt(LocalDateTime.now());
        attempt.setTimeTakenSeconds(request.getTotalTimeTakenSec());
        attempt.setStatus(AttemptStatus.COMPLETED);
        
        // Finalize score logic (if not done incrementally)
        int totalQ = attempt.getQuiz().getTotalQuestions() != null ? attempt.getQuiz().getTotalQuestions() : 0;
        if (totalQ > 0) {
            double percentage = ((double) attempt.getCorrectAnswers() / totalQ) * 100;
            attempt.setPercentage(percentage);
            
            boolean passed = percentage >= (attempt.getQuiz().getPassPercentage() != null ? attempt.getQuiz().getPassPercentage() : 50);
            attempt.setIsPassed(passed);
        }
        
        QuizAttempt saved = quizAttemptRepository.save(attempt);
        return quizMapper.toResponse(saved);
    }

    @Override
    public QuizAttemptResponse getAttempt(Long attemptId, Long userId) {
        QuizAttempt attempt = quizAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new AttemptNotFoundException("Attempt not found"));
        return quizMapper.toResponse(attempt);
    }

    @Override
    public List<AttemptAnswerResponse> getAttemptReview(Long attemptId, Long userId) {
        List<AttemptAnswer> answers = attemptAnswerRepository.findByAttemptId(attemptId);
        return answers.stream().map(quizMapper::toResponse).collect(Collectors.toList());
    }
}
