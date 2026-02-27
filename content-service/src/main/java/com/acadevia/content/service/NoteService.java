package com.acadevia.content.service;

import com.acadevia.content.dto.request.NoteCreateRequest;
import com.acadevia.content.dto.request.NoteUpdateRequest;
import com.acadevia.content.dto.response.NoteResponse;
import com.acadevia.content.dto.response.PageResponse;

import java.util.List;

public interface NoteService {

    NoteResponse createNote(NoteCreateRequest request);

    NoteResponse updateNote(Long noteId, NoteUpdateRequest request);

    List<NoteResponse> getNotesByVideoAndUser(Long videoId, Long userId);

    PageResponse<NoteResponse> getUserNotes(Long userId, int pageNo, int pageSize);

    List<NoteResponse> getPinnedNotes(Long userId);

    List<NoteResponse> searchNotes(Long userId, String keyword);

    void deleteNote(Long noteId);
}
