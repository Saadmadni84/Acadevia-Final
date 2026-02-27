package com.acadevia.quiz.mapper;

import com.acadevia.quiz.dto.request.CreateQuestionRequest;
import com.acadevia.quiz.dto.request.CreateQuizRequest;
import com.acadevia.quiz.dto.request.UpdateQuestionRequest;
import com.acadevia.quiz.dto.request.UpdateQuizRequest;
import com.acadevia.quiz.dto.response.AttemptAnswerResponse;
import com.acadevia.quiz.dto.response.QuestionResponse;
import com.acadevia.quiz.dto.response.QuizAttemptResponse;
import com.acadevia.quiz.dto.response.QuizResponse;
import com.acadevia.quiz.entity.AttemptAnswer;
import com.acadevia.quiz.entity.Question;
import com.acadevia.quiz.entity.Quiz;
import com.acadevia.quiz.entity.QuizAttempt;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class QuizMapper {

    public Quiz toEntity(CreateQuizRequest request) {
        Quiz quiz = new Quiz();
        quiz.setTitle(request.getTitle());
        quiz.setDescription(request.getDescription());
        quiz.setInstructions(request.getInstructions());
        
        quiz.setCourseId(request.getCourseId());
        quiz.setModuleId(request.getModuleId());
        quiz.setLessonId(request.getLessonId());
        
        quiz.setQuizType(request.getQuizType());
        quiz.setDifficultyLevel(request.getDifficultyLevel());
        
        quiz.setSubject(request.getSubject());
        quiz.setClassGrade(request.getClassGrade());
        quiz.setBoard(request.getBoard());
        quiz.setTopic(request.getTopic());
        
        // Tags handling if needed (string to list is handled by converter in Entity, here we set List directly)
        quiz.setTags(request.getTags());
        
        quiz.setTotalQuestions(request.getTotalQuestions());
        quiz.setTimeLimitMinutes(request.getTimeLimitMinutes());
        quiz.setPassPercentage(request.getPassPercentage());
        quiz.setMaxAttempts(request.getMaxAttempts());
        
        quiz.setNegativeMarking(request.getNegativeMarking());
        quiz.setNegativeMarkValue(request.getNegativeMarkValue());
        
        quiz.setShuffleQuestions(request.getShuffleQuestions());
        quiz.setShuffleOptions(request.getShuffleOptions());
        quiz.setShowCorrectAnswer(request.getShowCorrectAnswer());
        quiz.setShowExplanation(request.getShowExplanation());
        quiz.setShowResultImmediately(request.getShowResultImmediately());
        
        quiz.setXpReward(request.getXpReward());
        quiz.setXpPerCorrect(request.getXpPerCorrect());
        
        quiz.setCreatedAt(LocalDateTime.now());
        quiz.setUpdatedAt(LocalDateTime.now());
        
        return quiz;
    }

    public void updateEntity(Quiz quiz, UpdateQuizRequest request) {
        if (request.getTitle() != null) quiz.setTitle(request.getTitle());
        if (request.getDescription() != null) quiz.setDescription(request.getDescription());
        if (request.getInstructions() != null) quiz.setInstructions(request.getInstructions());
        if (request.getQuizType() != null) quiz.setQuizType(request.getQuizType());
        if (request.getDifficultyLevel() != null) quiz.setDifficultyLevel(request.getDifficultyLevel());
        if (request.getTotalQuestions() != null) quiz.setTotalQuestions(request.getTotalQuestions());
        if (request.getTimeLimitMinutes() != null) quiz.setTimeLimitMinutes(request.getTimeLimitMinutes());
        // ... include other fields ...
        quiz.setUpdatedAt(LocalDateTime.now());
    }

    public QuizResponse toResponse(Quiz quiz) {
        QuizResponse response = new QuizResponse();
        response.setId(quiz.getId());
        response.setTitle(quiz.getTitle());
        response.setDescription(quiz.getDescription());
        response.setInstructions(quiz.getInstructions());
        
        response.setCourseId(quiz.getCourseId());
        response.setModuleId(quiz.getModuleId());
        response.setLessonId(quiz.getLessonId());
        
        response.setQuizType(quiz.getQuizType());
        response.setQuizStatus(quiz.getQuizStatus());
        response.setDifficultyLevel(quiz.getDifficultyLevel());
        
        response.setSubject(quiz.getSubject());
        response.setTopic(quiz.getTopic());
        response.setTags(quiz.getTags());
        
        response.setTotalQuestions(quiz.getTotalQuestions());
        response.setTimeLimitMinutes(quiz.getTimeLimitMinutes());
        response.setPassPercentage(quiz.getPassPercentage());
        response.setMaxAttempts(quiz.getMaxAttempts());
        
        response.setNegativeMarking(quiz.getNegativeMarking());
        response.setNegativeMarkValue(quiz.getNegativeMarkValue());
        
        response.setShuffleQuestions(quiz.getShuffleQuestions());
        response.setShowResultImmediately(quiz.getShowResultImmediately());
        
        response.setXpReward(quiz.getXpReward());
        
        response.setTotalAttempts(quiz.getTotalAttempts());
        response.setAverageScore(quiz.getAvgScorePct());
        
        response.setCreatedAt(quiz.getCreatedAt());
        response.setUpdatedAt(quiz.getUpdatedAt());
        
        return response;
    }

    public Question toEntity(CreateQuestionRequest request) {
        Question q = new Question();
        // quizId is set in service usually by fetching quiz reference or setting ID if simple relationship
        // q.setQuiz(quizReference); 
        
        q.setQuestionText(request.getQuestionText());
        q.setQuestionType(request.getQuestionType());
        
        q.setOptionA(request.getOptionA());
        q.setOptionB(request.getOptionB());
        q.setOptionC(request.getOptionC());
        q.setOptionD(request.getOptionD());
        
        q.setCorrectAnswer(request.getCorrectAnswer());
        q.setCorrectOptions(request.getCorrectOptions());
        
        q.setExplanation(request.getExplanation());
        q.setHint(request.getHint());
        
        q.setDifficultyLevel(request.getDifficultyLevel());
        q.setMarks(request.getMarks());
        q.setXpValue(request.getXpValue());
        
        q.setSequenceOrder(request.getSequenceOrder());
        q.setIsActive(true);
        
        return q;
    }

    public QuestionResponse toResponse(Question question) {
        QuestionResponse response = new QuestionResponse();
        response.setId(question.getId());
        if (question.getQuiz() != null) {
            response.setQuizId(question.getQuiz().getId());
        }
        
        response.setQuestionText(question.getQuestionText());
        response.setQuestionType(question.getQuestionType());
        
        response.setOptionA(question.getOptionA());
        response.setOptionB(question.getOptionB());
        response.setOptionC(question.getOptionC());
        response.setOptionD(question.getOptionD());
        
        response.setCorrectAnswer(question.getCorrectAnswer());
        response.setCorrectOptions(question.getCorrectOptions());
        
        response.setExplanation(question.getExplanation());
        response.setHint(question.getHint());
        
        response.setDifficultyLevel(question.getDifficultyLevel());
        response.setMarks(question.getMarks());
        
        return response;
    }

    public QuizAttemptResponse toResponse(QuizAttempt attempt) {
        QuizAttemptResponse response = new QuizAttemptResponse();
        response.setId(attempt.getId());
        if (attempt.getQuiz() != null) {
            response.setQuizId(attempt.getQuiz().getId());
            response.setQuizTitle(attempt.getQuiz().getTitle());
        }
        response.setUserId(attempt.getUserId());
        
        response.setStatus(attempt.getStatus());
        response.setScore(attempt.getScore());
        response.setPercentage(attempt.getPercentage());
        response.setIsPassed(attempt.getIsPassed());
        
        response.setCorrectAnswers(attempt.getCorrectAnswers());
        response.setWrongAnswers(attempt.getWrongAnswers());
        
        response.setTotalTimeTakenSec(attempt.getTimeTakenSeconds());
        
        response.setXpEarned(attempt.getXpEarned());
        
        response.setStartTime(attempt.getStartedAt());
        response.setEndTime(attempt.getCompletedAt());
        
        return response;
    }

    public AttemptAnswerResponse toResponse(AttemptAnswer answer) {
        AttemptAnswerResponse response = new AttemptAnswerResponse();
        response.setId(answer.getId());
        if (answer.getQuestion() != null) {
            response.setQuestionId(answer.getQuestion().getId());
            response.setQuestionText(answer.getQuestion().getQuestionText());
            response.setCorrectAnswer(answer.getQuestion().getCorrectAnswer());
        }
        
        response.setSelectedOption(answer.getSelectedAnswer());
        response.setSelectedOptions(answer.getSelectedOptions());
        
        response.setIsCorrect(answer.getIsCorrect());
        response.setTimeTakenSec(answer.getTimeTakenSeconds());
        response.setMarksAwarded(answer.getMarksAwarded() != null ? answer.getMarksAwarded().intValue() : null);
        
        return response;
    }
}
