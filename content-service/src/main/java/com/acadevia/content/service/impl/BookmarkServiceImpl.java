package com.acadevia.content.service.impl;

import com.acadevia.content.dto.request.BookmarkCreateRequest;
import com.acadevia.content.dto.request.BookmarkUpdateRequest;
import com.acadevia.content.dto.response.BookmarkResponse;
import com.acadevia.content.dto.response.PageResponse;
import com.acadevia.content.entity.VideoBookmark;
import com.acadevia.content.exception.DuplicateResourceException;
import com.acadevia.content.exception.ResourceNotFoundException;
import com.acadevia.content.mapper.BookmarkMapper;
import com.acadevia.content.repository.VideoBookmarkRepository;
import com.acadevia.content.repository.VideoRepository;
import com.acadevia.content.service.BookmarkService;
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
public class BookmarkServiceImpl implements BookmarkService {

    private static final Logger log = LoggerFactory.getLogger(BookmarkServiceImpl.class);

    private final VideoBookmarkRepository bookmarkRepository;
    private final VideoRepository videoRepository;
    private final BookmarkMapper bookmarkMapper;

    @Override
    @Transactional
    public BookmarkResponse createBookmark(BookmarkCreateRequest request) {
        if (bookmarkRepository.existsByVideoIdAndUserIdAndTimestampSec(request.getVideoId(), request.getUserId(), request.getTimestampSec())) {
            throw new DuplicateResourceException("Bookmark already exists at this timestamp");
        }

        VideoBookmark bookmark = bookmarkMapper.toEntity(request);
        VideoBookmark saved = bookmarkRepository.save(bookmark);
        videoRepository.incrementTotalBookmarks(request.getVideoId());

        log.info("Bookmark created: id={}, videoId={}, userId={}", saved.getId(), request.getVideoId(), request.getUserId());
        return bookmarkMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public BookmarkResponse updateBookmark(Long bookmarkId, BookmarkUpdateRequest request) {
        VideoBookmark bookmark = findBookmarkById(bookmarkId);

        if (request.getTimestampSec() != null) bookmark.setTimestampSec(request.getTimestampSec());
        if (request.getTitle() != null) bookmark.setTitle(request.getTitle());
        if (request.getNote() != null) bookmark.setNote(request.getNote());
        if (request.getColor() != null) bookmark.setColor(request.getColor());
        if (request.getIsImportant() != null) bookmark.setIsImportant(request.getIsImportant());

        return bookmarkMapper.toResponse(bookmarkRepository.save(bookmark));
    }

    @Override
    public List<BookmarkResponse> getBookmarksByVideoAndUser(Long videoId, Long userId) {
        return bookmarkMapper.toResponseList(bookmarkRepository.findByVideoIdAndUserIdOrderByTimestampSecAsc(videoId, userId));
    }

    @Override
    public PageResponse<BookmarkResponse> getUserBookmarks(Long userId, int pageNo, int pageSize) {
        Page<VideoBookmark> page = bookmarkRepository.findByUserId(userId,
                PageRequest.of(pageNo, pageSize, Sort.by("createdAt").descending()));

        List<BookmarkResponse> content = page.getContent().stream()
                .map(bookmarkMapper::toResponse)
                .collect(Collectors.toList());

        return PageResponse.<BookmarkResponse>builder()
                .content(content)
                .pageNo(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    @Override
    public List<BookmarkResponse> getImportantBookmarks(Long userId) {
        return bookmarkMapper.toResponseList(bookmarkRepository.findImportantByUserId(userId));
    }

    @Override
    @Transactional
    public void deleteBookmark(Long bookmarkId) {
        VideoBookmark bookmark = findBookmarkById(bookmarkId);
        bookmarkRepository.delete(bookmark);
        videoRepository.decrementTotalBookmarks(bookmark.getVideoId());
    }

    private VideoBookmark findBookmarkById(Long bookmarkId) {
        return bookmarkRepository.findById(bookmarkId)
                .orElseThrow(() -> new ResourceNotFoundException("Bookmark", "id", bookmarkId));
    }
}
