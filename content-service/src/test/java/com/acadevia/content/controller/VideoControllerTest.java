package com.acadevia.content.controller;

import com.acadevia.content.dto.request.VideoCreateRequest;
import com.acadevia.content.dto.response.*;
import com.acadevia.content.service.VideoService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(VideoController.class)
class VideoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private VideoService videoService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void createVideo_shouldReturn201() throws Exception {
        VideoCreateRequest request = VideoCreateRequest.builder()
                .title("Test Video")
                .lessonId(1L)
                .courseId(1L)
                .moduleId(1L)
                .createdBy(1L)
                .durationSeconds(300)
                .build();

        VideoResponse response = VideoResponse.builder()
                .id(1L)
                .title("Test Video")
                .lessonId(1L)
                .courseId(1L)
                .durationSeconds(300)
                .build();

        when(videoService.createVideo(any())).thenReturn(response);

        mockMvc.perform(post("/api/content/videos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.title").value("Test Video"));
    }

    @Test
    void getVideoDetail_shouldReturn200() throws Exception {
        VideoDetailResponse response = VideoDetailResponse.builder()
                .id(1L)
                .title("Test Video")
                .build();

        when(videoService.getVideoDetail(1L)).thenReturn(response);

        mockMvc.perform(get("/api/content/videos/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(1));
    }

    @Test
    void deleteVideo_shouldReturn200() throws Exception {
        mockMvc.perform(delete("/api/content/videos/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Video deleted"));
    }
}
