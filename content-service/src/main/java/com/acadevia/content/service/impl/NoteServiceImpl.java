package com.acadevia.content.service.impl;

import com.acadevia.content.dto.request.NoteCreateRequest;
import com.acadevia.content.dto.request.NoteUpdateRequest;
import com.acadevia.content.dto.response.NoteResponse;
import com.acadevia.content.dto.response.PageResponse;
import com.acadevia.content.entity.VideoNote;
import com.acadevia.content.exception.ResourceNotFoundException;
import com.acadevia.content.mapper.NoteMapper;
import com.acadevia.content.repository.VideoNoteRepository;
import com.acadevia.content.repository.VideoRepository;
import com.acadevia.content.service.NoteService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NoteServiceImpl implements NoteService {

    private static final Logger log = LoggerFactory.getLogger(NoteServiceImpl.class);

    private final VideoNoteRepository noteRepository;
    private final VideoRepository videoRepository;
    private final NoteMapper noteMapper;

    @Override
    @Transactional
    public NoteResponse createNote(NoteCreateRequest request) {
        VideoNote note = noteMapper.toEntity(request);
        VideoNote saved = noteRepository.save(note);
        videoRepository.incrementTotalNotes(request.getVideoId());

        log.info("Note created: id={}, videoId={}, userId={}", saved.getId(), request.getVideoId(), request.getUserId());
        return noteMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public NoteResponse updateNote(Long noteId, NoteUpdateRequest request) {
        VideoNote note = findNoteById(noteId);

        if (request.getTimestampSec() != null) note.setTimestampSec(request.getTimestampSec());
        if (request.getContent() != null) note.setContent(request.getContent());
        if (request.getFormattedContent() != null) note.setFormattedContent(request.getFormattedContent());
        if (request.getHasDrawing() != null) note.setHasDrawing(request.getHasDrawing());
        if (request.getDrawingData() != null) note.setDrawingData(request.getDrawingData());
        if (request.getScreenshotUrl() != null) note.setScreenshotUrl(request.getScreenshotUrl());
        if (request.getIsPinned() != null) note.setIsPinned(request.getIsPinned());

        return noteMapper.toResponse(noteRepository.save(note));
    }

    @Override
    public List<NoteResponse> getNotesByVideoAndUser(Long videoId, Long userId) {
        return noteMapper.toResponseList(noteRepository.findByVideoIdAndUserIdOrderByTimestampSecAsc(videoId, userId));
    }

    @Override
    public PageResponse<NoteResponse> getUserNotes(Long userId, int pageNo, int pageSize) {
        Page<VideoNote> page = noteRepository.findByUserId(userId,
                PageRequest.of(pageNo, pageSize, Sort.by("createdAt").descending()));

        List<NoteResponse> content = page.getContent().stream()
                .map(noteMapper::toResponse)
                .collect(Collectors.toList());

        return PageResponse.<NoteResponse>builder()
                .content(content)
                .pageNo(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    @Override
    public List<NoteResponse> getPinnedNotes(Long userId) {
        return noteMapper.toResponseList(noteRepository.findPinnedByUserId(userId));
    }

    @Override
    public List<NoteResponse> searchNotes(Long userId, String keyword) {
        return noteMapper.toResponseList(noteRepository.searchByUserAndKeyword(userId, keyword));
    }

    @Override
    @Transactional
    public void deleteNote(Long noteId) {
        VideoNote note = findNoteById(noteId);
        noteRepository.delete(note);
        videoRepository.decrementTotalNotes(note.getVideoId());
    }

    private VideoNote findNoteById(Long noteId) {
        return noteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Note", "id", noteId));
    }
}
