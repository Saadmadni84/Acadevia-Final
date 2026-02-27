package com.acadevia.content.service.impl;

import com.acadevia.content.dto.event.PopQuestionAnsweredEvent;
import com.acadevia.content.dto.request.PopQuestionAnswerRequest;
import com.acadevia.content.dto.request.PopQuestionCreateRequest;
import com.acadevia.content.dto.request.PopQuestionUpdateRequest;
import com.acadevia.content.dto.response.PopQuestionAnswerResponse;
import com.acadevia.content.dto.response.PopQuestionDetailResponse;
import com.acadevia.content.dto.response.PopQuestionResponse;
import com.acadevia.content.entity.Video;
import com.acadevia.content.entity.VideoPopQuestion;
import com.acadevia.content.entity.VideoPopResponse;
import com.acadevia.content.entity.enums.Difficulty;
import com.acadevia.content.entity.enums.QuestionType;
import com.acadevia.content.exception.InvalidQuestionAnswerException;
import com.acadevia.content.exception.ResourceNotFoundException;
import com.acadevia.content.mapper.PopQuestionMapper;
import com.acadevia.content.repository.VideoPopQuestionRepository;
import com.acadevia.content.repository.VideoPopResponseRepository;
import com.acadevia.content.repository.VideoRepository;
import com.acadevia.content.service.PopQuestionService;
import com.acadevia.content.util.AppConstants;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PopQuestionServiceImpl implements PopQuestionService {

    private static final Logger log = LoggerFactory.getLogger(PopQuestionServiceImpl.class);

    private final VideoPopQuestionRepository questionRepository;
    private final VideoPopResponseRepository responseRepository;
    private final VideoRepository videoRepository;
    private final PopQuestionMapper popQuestionMapper;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    @Transactional
    public PopQuestionResponse createPopQuestion(PopQuestionCreateRequest request) {
        Video video = videoRepository.findById(request.getVideoId())
                .orElseThrow(() -> new ResourceNotFoundException("Video", "id", request.getVideoId()));

        VideoPopQuestion question = popQuestionMapper.toEntity(request);
        question.setVideo(video);

        if (request.getSequenceOrder() == null) {
            Integer maxOrder = questionRepository.findMaxSequenceOrderByVideoId(request.getVideoId());
            question.setSequenceOrder(maxOrder != null ? maxOrder + 1 : 1);
        }

        VideoPopQuestion saved = questionRepository.save(question);

        Long count = questionRepository.countByVideoIdAndIsActiveTrue(request.getVideoId());
        videoRepository.updateTotalPopQuestions(request.getVideoId(), count.intValue());

        log.info("Pop question created: id={}, videoId={}", saved.getId(), request.getVideoId());
        return popQuestionMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public PopQuestionResponse updatePopQuestion(Long questionId, PopQuestionUpdateRequest request) {
        VideoPopQuestion question = findQuestionById(questionId);

        if (request.getTimestampSec() != null) question.setTimestampSec(request.getTimestampSec());
        if (request.getQuestionText() != null) question.setQuestionText(request.getQuestionText());
        if (request.getQuestionType() != null) question.setQuestionType(QuestionType.valueOf(request.getQuestionType()));
        if (request.getOptionA() != null) question.setOptionA(request.getOptionA());
        if (request.getOptionB() != null) question.setOptionB(request.getOptionB());
        if (request.getOptionC() != null) question.setOptionC(request.getOptionC());
        if (request.getOptionD() != null) question.setOptionD(request.getOptionD());
        if (request.getCorrectAnswer() != null) question.setCorrectAnswer(request.getCorrectAnswer());
        if (request.getExplanation() != null) question.setExplanation(request.getExplanation());
        if (request.getHint() != null) question.setHint(request.getHint());
        if (request.getXpReward() != null) question.setXpReward(request.getXpReward());
        if (request.getLanguageCode() != null) question.setLanguageCode(request.getLanguageCode());
        if (request.getTopic() != null) question.setTopic(request.getTopic());
        if (request.getConcept() != null) question.setConcept(request.getConcept());
        if (request.getDifficulty() != null) question.setDifficulty(Difficulty.valueOf(request.getDifficulty()));
        if (request.getSequenceOrder() != null) question.setSequenceOrder(request.getSequenceOrder());
        if (request.getIsMandatory() != null) question.setIsMandatory(request.getIsMandatory());
        if (request.getPauseVideo() != null) question.setPauseVideo(request.getPauseVideo());
        if (request.getTimeLimitSec() != null) question.setTimeLimitSec(request.getTimeLimitSec());
        if (request.getAllowSkip() != null) question.setAllowSkip(request.getAllowSkip());
        if (request.getShowExplanation() != null) question.setShowExplanation(request.getShowExplanation());
        if (request.getIsActive() != null) question.setIsActive(request.getIsActive());

        return popQuestionMapper.toResponse(questionRepository.save(question));
    }

    @Override
    public PopQuestionResponse getPopQuestionById(Long questionId) {
        return popQuestionMapper.toResponse(findQuestionById(questionId));
    }

    @Override
    public List<PopQuestionResponse> getPopQuestionsByVideoId(Long videoId) {
        return popQuestionMapper.toResponseList(questionRepository.findByVideoIdAndIsActiveTrueOrderBySequenceOrder(videoId));
    }

    @Override
    public List<PopQuestionResponse> getPopQuestionsByVideoIdAndTimestampRange(Long videoId, Integer startSec, Integer endSec) {
        return popQuestionMapper.toResponseList(questionRepository.findByVideoIdAndTimestampRange(videoId, startSec, endSec));
    }

    @Override
    @Transactional
    public void deletePopQuestion(Long questionId) {
        VideoPopQuestion question = findQuestionById(questionId);
        question.setIsActive(false);
        questionRepository.save(question);

        Long count = questionRepository.countByVideoIdAndIsActiveTrue(question.getVideoId());
        videoRepository.updateTotalPopQuestions(question.getVideoId(), count.intValue());
    }

    @Override
    @Transactional
    public PopQuestionAnswerResponse answerPopQuestion(PopQuestionAnswerRequest request) {
        VideoPopQuestion question = findQuestionById(request.getQuestionId());

        boolean isCorrect = question.getCorrectAnswer().equalsIgnoreCase(request.getSelectedAnswer().trim());

        Integer attemptCount = responseRepository.countAttemptsByQuestionAndUser(request.getQuestionId(), request.getUserId());
        int attemptNumber = (attemptCount != null ? attemptCount : 0) + 1;

        int xpEarned = 0;
        if (isCorrect) {
            xpEarned = attemptNumber == 1 ? question.getXpReward() * 2 : question.getXpReward();
        }

        VideoPopResponse popResponse = VideoPopResponse.builder()
                .popQuestion(question)
                .popQuestionId(question.getId())
                .userId(request.getUserId())
                .selectedAnswer(request.getSelectedAnswer())
                .isCorrect(isCorrect)
                .timeTakenSec(request.getTimeTakenSec())
                .xpEarned(xpEarned)
                .attemptNumber(attemptNumber)
                .answeredAt(LocalDateTime.now())
                .build();

        VideoPopResponse saved = responseRepository.save(popResponse);

        questionRepository.incrementTotalAttempts(question.getId());
        if (isCorrect) {
            questionRepository.incrementCorrectAttempts(question.getId());
        }
        questionRepository.updateAccuracyRate(question.getId());

        // Publish Kafka event
        try {
            PopQuestionAnsweredEvent event = PopQuestionAnsweredEvent.builder()
                    .questionId(question.getId())
                    .videoId(question.getVideoId())
                    .userId(request.getUserId())
                    .lessonId(question.getVideo().getLessonId())
                    .courseId(question.getVideo().getCourseId())
                    .selectedAnswer(request.getSelectedAnswer())
                    .isCorrect(isCorrect)
                    .xpEarned(xpEarned)
                    .timeTakenSec(request.getTimeTakenSec())
                    .attemptNumber(attemptNumber)
                    .questionType(question.getQuestionType().name())
                    .difficulty(question.getDifficulty().name())
                    .topic(question.getTopic())
                    .answeredAt(LocalDateTime.now())
                    .eventType("POP_QUESTION_ANSWERED")
                    .build();
            kafkaTemplate.send(AppConstants.TOPIC_POP_ANSWERED, String.valueOf(question.getId()), event);
        } catch (Exception e) {
            log.warn("Failed to send pop question answered event: {}", e.getMessage());
        }

        return PopQuestionAnswerResponse.builder()
                .id(saved.getId())
                .popQuestionId(question.getId())
                .userId(request.getUserId())
                .selectedAnswer(request.getSelectedAnswer())
                .isCorrect(isCorrect)
                .timeTakenSec(request.getTimeTakenSec())
                .xpEarned(xpEarned)
                .attemptNumber(attemptNumber)
                .answeredAt(saved.getAnsweredAt())
                .build();
    }

    @Override
    public PopQuestionDetailResponse getPopQuestionDetail(Long questionId, Long userId) {
        VideoPopQuestion question = findQuestionById(questionId);
        List<VideoPopResponse> responses = responseRepository.findByPopQuestionIdAndUserId(questionId, userId);

        int totalAttempts = responses.size();
        int correctAttempts = (int) responses.stream().filter(VideoPopResponse::getIsCorrect).count();
        double avgTime = responses.stream()
                .filter(r -> r.getTimeTakenSec() != null)
                .mapToInt(VideoPopResponse::getTimeTakenSec)
                .average()
                .orElse(0.0);
        int totalXp = responses.stream()
                .filter(r -> r.getXpEarned() != null)
                .mapToInt(VideoPopResponse::getXpEarned)
                .sum();

        List<PopQuestionAnswerResponse> answerResponses = responses.stream()
                .map(r -> PopQuestionAnswerResponse.builder()
                        .id(r.getId())
                        .popQuestionId(r.getPopQuestionId())
                        .userId(r.getUserId())
                        .selectedAnswer(r.getSelectedAnswer())
                        .isCorrect(r.getIsCorrect())
                        .timeTakenSec(r.getTimeTakenSec())
                        .xpEarned(r.getXpEarned())
                        .attemptNumber(r.getAttemptNumber())
                        .answeredAt(r.getAnsweredAt())
                        .build())
                .collect(Collectors.toList());

        return PopQuestionDetailResponse.builder()
                .question(popQuestionMapper.toResponse(question))
                .userResponses(answerResponses)
                .result(PopQuestionDetailResponse.PopQuestionDetailResult.builder()
                        .totalAttempts(totalAttempts)
                        .correctAttempts(correctAttempts)
                        .accuracyRate(totalAttempts > 0 ? (correctAttempts * 100.0 / totalAttempts) : 0)
                        .avgTimeTaken(avgTime)
                        .totalXpEarned(totalXp)
                        .lastAttemptCorrect(!responses.isEmpty() && responses.get(responses.size() - 1).getIsCorrect())
                        .build())
                .build();
    }

    @Override
    public List<PopQuestionAnswerResponse> getUserResponsesForVideo(Long videoId, Long userId) {
        return responseRepository.findByVideoIdAndUserId(videoId, userId).stream()
                .map(r -> PopQuestionAnswerResponse.builder()
                        .id(r.getId())
                        .popQuestionId(r.getPopQuestionId())
                        .userId(r.getUserId())
                        .selectedAnswer(r.getSelectedAnswer())
                        .isCorrect(r.getIsCorrect())
                        .timeTakenSec(r.getTimeTakenSec())
                        .xpEarned(r.getXpEarned())
                        .attemptNumber(r.getAttemptNumber())
                        .answeredAt(r.getAnsweredAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public Integer getUserXpForVideo(Long videoId, Long userId) {
        Integer xp = responseRepository.sumXpEarnedByVideoIdAndUserId(videoId, userId);
        return xp != null ? xp : 0;
    }

    private VideoPopQuestion findQuestionById(Long questionId) {
        return questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("PopQuestion", "id", questionId));
    }
}
