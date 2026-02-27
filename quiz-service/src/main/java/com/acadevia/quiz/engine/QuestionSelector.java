package com.acadevia.quiz.engine;

import com.acadevia.quiz.entity.Question;
import com.acadevia.quiz.entity.enums.DifficultyLevel;
import com.acadevia.quiz.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class QuestionSelector {

    private final QuestionRepository questionRepository;

    /**
     * Selects questions for a standard quiz, optionally shuffling them.
     */
    public List<Question> selectQuestionsForQuiz(Long quizId, boolean shuffle, int limit) {
        List<Question> questions = questionRepository.findByQuizIdOrderBySequenceOrderAsc(quizId);
        
        if (shuffle) {
            Collections.shuffle(questions);
        }
        
        if (limit > 0 && limit < questions.size()) {
            return questions.subList(0, limit);
        }
        return questions;
    }

    /**
     * Selects questions for an adaptive test based on current user level.
     * Starts with medium, adjusts based on performance (handled by AdaptiveEngine mostly).
     * This method fetches a pool of candidate questions.
     */
    public List<Question> selectCandidateQuestions(String subject, String topic, DifficultyLevel difficulty) {
        // In a real scenario, we might have a massive question bank.
        // Simplified: Fetch by subject/topic/difficulty
        return questionRepository.findBySubjectAndTopicAndDifficultyLevel(subject, topic, difficulty);
    }
    
    /**
     * Selects specific questions by IDs
     */
    public List<Question> selectQuestionsByIds(List<Long> questionIds) {
        return questionRepository.findAllById(questionIds);
    }
}
