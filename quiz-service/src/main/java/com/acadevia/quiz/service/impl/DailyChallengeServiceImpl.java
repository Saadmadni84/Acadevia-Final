package com.acadevia.quiz.service.impl;

import com.acadevia.quiz.dto.response.QuizResponse;
import com.acadevia.quiz.entity.DailyChallenge;
import com.acadevia.quiz.entity.Question;
import com.acadevia.quiz.entity.Quiz;
import com.acadevia.quiz.entity.enums.DifficultyLevel;
import com.acadevia.quiz.entity.enums.QuizType;
import com.acadevia.quiz.mapper.QuizMapper;
import com.acadevia.quiz.repository.DailyChallengeRepository;
import com.acadevia.quiz.repository.QuestionRepository;
import com.acadevia.quiz.repository.QuizRepository;
import com.acadevia.quiz.service.DailyChallengeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DailyChallengeServiceImpl implements DailyChallengeService {

    private final DailyChallengeRepository dailyChallengeRepository;
    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final QuizMapper quizMapper;

    @Override
    @Transactional
    public QuizResponse getDailyChallenge(Long userId, String subject, Integer classGrade) {
        LocalDate today = LocalDate.now();
        
        return dailyChallengeRepository.findByChallengeDateAndClassGradeAndSubject(today, classGrade, subject)
                .map(challenge -> {
                    return quizRepository.findById(challenge.getQuizId())
                            .map(quizMapper::toResponse)
                            .orElseThrow(() -> new RuntimeException("Quiz not found"));
                })
                .orElseGet(() -> {
                     return quizMapper.toResponse(createDailyChallenge(today, subject, classGrade));
                });
    }

    private Quiz createDailyChallenge(LocalDate date, String subject, Integer classGrade) {
        // Create a new Quiz
        Quiz quiz = new Quiz();
        quiz.setTitle("Daily " + subject + " Challenge - " + date);
        quiz.setDescription("Challenge yourself with today's questions!");
        quiz.setQuizType(QuizType.DAILY); 
        quiz.setSubject(subject);
        quiz.setClassGrade(classGrade);
        quiz.setDifficultyLevel(DifficultyLevel.MIXED);
        quiz.setTotalQuestions(10);
        quiz.setTimeLimitMinutes(15);
        quiz.setMaxAttempts(1); // One shot
        quiz.setCreatedBy(0L); // System
        quiz.setCreatedAt(LocalDateTime.now());
        quiz.setUpdatedAt(LocalDateTime.now());
        quiz.setIsActive(true);
        quiz.setXpReward(50);
        quiz.setXpPerCorrect(10);
        
        quiz = quizRepository.save(quiz);
        
        List<Question> questions = questionRepository.findRandomQuestionsForDailyChallenge(subject, classGrade, 10);
        
        for (Question q : questions) {
            Question clone = new Question();
            clone.setQuiz(quiz); // Set parent
            clone.setQuestionText(q.getQuestionText());
            clone.setOptionA(q.getOptionA());
            clone.setOptionB(q.getOptionB());
            clone.setOptionC(q.getOptionC());
            clone.setOptionD(q.getOptionD());
            clone.setCorrectAnswer(q.getCorrectAnswer());
            clone.setExplanation(q.getExplanation());
            clone.setSubject(subject);
            clone.setTopic(q.getTopic());
            clone.setDifficultyLevel(q.getDifficultyLevel());
            clone.setQuestionType(q.getQuestionType());
            clone.setXpValue(q.getXpValue());
            clone.setMarks(q.getMarks());
            clone.setTimeExpectedSec(q.getTimeExpectedSec());
            
            clone.setIsActive(true);
            clone.setIsBankQuestion(false); // cloned instance
            // sequence
            // clone.setSequenceOrder(i++);
            
            questionRepository.save(clone);
        }
        
        // Create DailyChallenge record
        DailyChallenge challenge = new DailyChallenge();
        challenge.setChallengeDate(date);
        challenge.setSubject(subject);
        challenge.setClassGrade(classGrade);
        challenge.setTitle(quiz.getTitle());
        challenge.setQuizId(quiz.getId());
        challenge.setXpReward(50);
        challenge.setDescription(quiz.getDescription());
        
        dailyChallengeRepository.save(challenge);
        
        return quiz;
    }
}
