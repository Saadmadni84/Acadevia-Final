package com.acadevia.content.controller;

import com.acadevia.content.dto.request.NoteCreateRequest;
import com.acadevia.content.dto.response.NoteResponse;
import com.acadevia.content.service.NoteService;
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

@WebMvcTest(NoteController.class)
class NoteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private NoteService noteService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void createNote_shouldReturn201() throws Exception {
        NoteCreateRequest request = NoteCreateRequest.builder()
                .videoId(1L)
                .userId(1L)
                .timestampSec(90)
                .content("This is important")
                .build();

        NoteResponse response = NoteResponse.builder()
                .id(1L)
                .videoId(1L)
                .userId(1L)
                .timestampSec(90)
                .content("This is important")
                .build();

        when(noteService.createNote(any())).thenReturn(response);

        mockMvc.perform(post("/api/content/notes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.id").value(1));
    }

    @Test
    void searchNotes_shouldReturn200() throws Exception {
        when(noteService.searchNotes(1L, "important")).thenReturn(List.of());

        mockMvc.perform(get("/api/content/notes/user/1/search")
                        .param("keyword", "important"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    void deleteNote_shouldReturn200() throws Exception {
        mockMvc.perform(delete("/api/content/notes/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Note deleted"));
    }
}
