package com.acadevia.content.controller;

import com.acadevia.content.dto.request.PopQuestionCreateRequest;
import com.acadevia.content.dto.request.PopQuestionAnswerRequest;
import com.acadevia.content.dto.response.ApiResponse;
import com.acadevia.content.dto.response.PopQuestionAnswerResponse;
import com.acadevia.content.dto.response.PopQuestionResponse;
import com.acadevia.content.service.PopQuestionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PopQuestionController.class)
class PopQuestionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PopQuestionService popQuestionService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void createPopQuestion_shouldReturn201() throws Exception {
        PopQuestionCreateRequest request = PopQuestionCreateRequest.builder()
                .videoId(1L)
                .timestampSec(60)
                .questionText("What is Java?")
                .questionType("MULTIPLE_CHOICE")
                .correctAnswer("A")
                .optionA("A language")
                .optionB("A coffee")
                .sequenceOrder(1)
                .build();

        PopQuestionResponse response = PopQuestionResponse.builder()
                .id(1L)
                .videoId(1L)
                .questionText("What is Java?")
                .build();

        when(popQuestionService.createPopQuestion(any())).thenReturn(response);

        mockMvc.perform(post("/api/content/pop-questions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.id").value(1));
    }

    @Test
    void answerQuestion_shouldReturn200() throws Exception {
        PopQuestionAnswerRequest request = PopQuestionAnswerRequest.builder()
                .questionId(1L)
                .userId(1L)
                .selectedAnswer("A")
                .timeTakenSec(5)
                .build();

        PopQuestionAnswerResponse response = PopQuestionAnswerResponse.builder()
                .popQuestionId(1L)
                .isCorrect(true)
                .xpEarned(10)
                .build();

        when(popQuestionService.answerPopQuestion(any())).thenReturn(response);

        mockMvc.perform(post("/api/content/pop-questions/1/answer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.isCorrect").value(true));
    }

    @Test
    void getQuestionsByVideo_shouldReturn200() throws Exception {
        when(popQuestionService.getPopQuestionsByVideoId(1L)).thenReturn(List.of());

        mockMvc.perform(get("/api/content/pop-questions/video/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray());
    }
}
