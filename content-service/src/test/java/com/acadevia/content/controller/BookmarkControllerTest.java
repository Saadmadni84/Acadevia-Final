package com.acadevia.content.controller;

import com.acadevia.content.dto.request.BookmarkCreateRequest;
import com.acadevia.content.dto.response.BookmarkResponse;
import com.acadevia.content.service.BookmarkService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(BookmarkController.class)
class BookmarkControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private BookmarkService bookmarkService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void createBookmark_shouldReturn201() throws Exception {
        BookmarkCreateRequest request = BookmarkCreateRequest.builder()
                .videoId(1L)
                .userId(1L)
                .timestampSec(120)
                .title("Important concept")
                .build();

        BookmarkResponse response = BookmarkResponse.builder()
                .id(1L)
                .videoId(1L)
                .userId(1L)
                .timestampSec(120)
                .title("Important concept")
                .build();

        when(bookmarkService.createBookmark(any())).thenReturn(response);

        mockMvc.perform(post("/api/content/bookmarks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.id").value(1));
    }

    @Test
    void getVideoBookmarks_shouldReturn200() throws Exception {
        when(bookmarkService.getBookmarksByVideoAndUser(1L, 1L)).thenReturn(List.of());

        mockMvc.perform(get("/api/content/bookmarks/video/1/user/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    void deleteBookmark_shouldReturn200() throws Exception {
        mockMvc.perform(delete("/api/content/bookmarks/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Bookmark deleted"));
    }
}
