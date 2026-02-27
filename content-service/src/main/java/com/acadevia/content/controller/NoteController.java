package com.acadevia.content.controller;

import com.acadevia.content.dto.request.NoteCreateRequest;
import com.acadevia.content.dto.request.NoteUpdateRequest;
import com.acadevia.content.dto.response.ApiResponse;
import com.acadevia.content.dto.response.NoteResponse;
import com.acadevia.content.dto.response.PageResponse;
import com.acadevia.content.service.NoteService;
import com.acadevia.content.util.AppConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/content/notes")
@RequiredArgsConstructor
public class NoteController {

    private final NoteService noteService;

    @PostMapping
    public ResponseEntity<ApiResponse<NoteResponse>> createNote(
            @Valid @RequestBody NoteCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(noteService.createNote(request), "Note created"));
    }

    @PutMapping("/{noteId}")
    public ResponseEntity<ApiResponse<NoteResponse>> updateNote(
            @PathVariable Long noteId, @Valid @RequestBody NoteUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(noteService.updateNote(noteId, request)));
    }

    @GetMapping("/video/{videoId}/user/{userId}")
    public ResponseEntity<ApiResponse<List<NoteResponse>>> getVideoNotes(
            @PathVariable Long videoId, @PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(noteService.getNotesByVideoAndUser(videoId, userId)));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<PageResponse<NoteResponse>>> getUserNotes(
            @PathVariable Long userId,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_NUMBER) int pageNo,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_SIZE) int pageSize) {
        return ResponseEntity.ok(ApiResponse.ok(noteService.getUserNotes(userId, pageNo, pageSize)));
    }

    @GetMapping("/user/{userId}/pinned")
    public ResponseEntity<ApiResponse<List<NoteResponse>>> getPinnedNotes(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(noteService.getPinnedNotes(userId)));
    }

    @GetMapping("/user/{userId}/search")
    public ResponseEntity<ApiResponse<List<NoteResponse>>> searchNotes(
            @PathVariable Long userId, @RequestParam String keyword) {
        return ResponseEntity.ok(ApiResponse.ok(noteService.searchNotes(userId, keyword)));
    }

    @DeleteMapping("/{noteId}")
    public ResponseEntity<ApiResponse<Void>> deleteNote(@PathVariable Long noteId) {
        noteService.deleteNote(noteId);
        return ResponseEntity.ok(ApiResponse.ok(null, "Note deleted"));
    }
}
