package com.acadevia.content.service;

import com.acadevia.content.dto.request.PopQuestionAnswerRequest;
import com.acadevia.content.dto.response.PopQuestionAnswerResponse;
import com.acadevia.content.entity.VideoPopQuestion;
import com.acadevia.content.entity.VideoPopResponse;
import com.acadevia.content.entity.enums.Difficulty;
import com.acadevia.content.entity.enums.QuestionType;
import com.acadevia.content.exception.ResourceNotFoundException;
import com.acadevia.content.mapper.PopQuestionMapper;
import com.acadevia.content.repository.VideoPopQuestionRepository;
import com.acadevia.content.repository.VideoPopResponseRepository;
import com.acadevia.content.service.impl.PopQuestionServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PopQuestionServiceImplTest {

    @Mock
    private VideoPopQuestionRepository questionRepository;

    @Mock
    private VideoPopResponseRepository responseRepository;

    @Mock
    private PopQuestionMapper questionMapper;

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    @InjectMocks
    private PopQuestionServiceImpl popQuestionService;

    @Test
    void answerQuestion_correctAnswer_shouldAwardXp() {
        VideoPopQuestion question = VideoPopQuestion.builder()
                .id(1L)
                .videoId(1L)
                .correctAnswer("A")
                .xpReward(10)
                .totalAttempts(0)
                .correctCount(0)
                .build();

        PopQuestionAnswerRequest request = PopQuestionAnswerRequest.builder()
                .questionId(1L)
                .userId(1L)
                .selectedAnswer("A")
                .timeTakenSec(5)
                .build();

        when(questionRepository.findById(1L)).thenReturn(Optional.of(question));
        when(responseRepository.countAttemptsByQuestionAndUser(1L, 1L)).thenReturn(0);
        when(responseRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        PopQuestionAnswerResponse result = popQuestionService.answerPopQuestion(request);

        assertTrue(result.getIsCorrect());
        assertEquals(20, result.getXpEarned()); // 2x for first correct
        verify(responseRepository).save(any());
    }

    @Test
    void answerQuestion_wrongAnswer_shouldAwardZeroXp() {
        VideoPopQuestion question = VideoPopQuestion.builder()
                .id(1L)
                .videoId(1L)
                .correctAnswer("A")
                .xpReward(10)
                .totalAttempts(0)
                .correctCount(0)
                .build();

        PopQuestionAnswerRequest request = PopQuestionAnswerRequest.builder()
                .questionId(1L)
                .userId(1L)
                .selectedAnswer("B")
                .timeTakenSec(5)
                .build();

        when(questionRepository.findById(1L)).thenReturn(Optional.of(question));
        when(responseRepository.countAttemptsByQuestionAndUser(1L, 1L)).thenReturn(0);
        when(responseRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        PopQuestionAnswerResponse result = popQuestionService.answerPopQuestion(request);

        assertFalse(result.getIsCorrect());
        assertEquals(0, result.getXpEarned());
    }

    @Test
    void answerQuestion_notFound_shouldThrow() {
        when(questionRepository.findById(99L)).thenReturn(Optional.empty());

        PopQuestionAnswerRequest request = PopQuestionAnswerRequest.builder()
                .questionId(99L)
                .userId(1L)
                .selectedAnswer("A")
                .build();

        assertThrows(ResourceNotFoundException.class, () -> popQuestionService.answerPopQuestion(request));
    }
}
