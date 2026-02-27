package com.acadevia.content.service;

import com.acadevia.content.dto.request.PopQuestionAnswerRequest;
import com.acadevia.content.dto.request.PopQuestionCreateRequest;
import com.acadevia.content.dto.request.PopQuestionUpdateRequest;
import com.acadevia.content.dto.response.PopQuestionAnswerResponse;
import com.acadevia.content.dto.response.PopQuestionDetailResponse;
import com.acadevia.content.dto.response.PopQuestionResponse;

import java.util.List;

public interface PopQuestionService {

    PopQuestionResponse createPopQuestion(PopQuestionCreateRequest request);

    PopQuestionResponse updatePopQuestion(Long questionId, PopQuestionUpdateRequest request);

    PopQuestionResponse getPopQuestionById(Long questionId);

    List<PopQuestionResponse> getPopQuestionsByVideoId(Long videoId);

    List<PopQuestionResponse> getPopQuestionsByVideoIdAndTimestampRange(Long videoId, Integer startSec, Integer endSec);

    void deletePopQuestion(Long questionId);

    PopQuestionAnswerResponse answerPopQuestion(PopQuestionAnswerRequest request);

    PopQuestionDetailResponse getPopQuestionDetail(Long questionId, Long userId);

    List<PopQuestionAnswerResponse> getUserResponsesForVideo(Long videoId, Long userId);

    Integer getUserXpForVideo(Long videoId, Long userId);
}
