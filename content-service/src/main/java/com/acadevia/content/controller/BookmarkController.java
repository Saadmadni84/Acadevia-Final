package com.acadevia.content.controller;

import com.acadevia.content.dto.request.BookmarkCreateRequest;
import com.acadevia.content.dto.request.BookmarkUpdateRequest;
import com.acadevia.content.dto.response.ApiResponse;
import com.acadevia.content.dto.response.BookmarkResponse;
import com.acadevia.content.dto.response.PageResponse;
import com.acadevia.content.service.BookmarkService;
import com.acadevia.content.util.AppConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/content/bookmarks")
@RequiredArgsConstructor
public class BookmarkController {

    private final BookmarkService bookmarkService;

    @PostMapping
    public ResponseEntity<ApiResponse<BookmarkResponse>> createBookmark(
            @Valid @RequestBody BookmarkCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(bookmarkService.createBookmark(request), "Bookmark created"));
    }

    @PutMapping("/{bookmarkId}")
    public ResponseEntity<ApiResponse<BookmarkResponse>> updateBookmark(
            @PathVariable Long bookmarkId, @Valid @RequestBody BookmarkUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(bookmarkService.updateBookmark(bookmarkId, request)));
    }

    @GetMapping("/video/{videoId}/user/{userId}")
    public ResponseEntity<ApiResponse<List<BookmarkResponse>>> getVideoBookmarks(
            @PathVariable Long videoId, @PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(bookmarkService.getBookmarksByVideoAndUser(videoId, userId)));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<PageResponse<BookmarkResponse>>> getUserBookmarks(
            @PathVariable Long userId,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_NUMBER) int pageNo,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_SIZE) int pageSize) {
        return ResponseEntity.ok(ApiResponse.ok(bookmarkService.getUserBookmarks(userId, pageNo, pageSize)));
    }

    @GetMapping("/user/{userId}/important")
    public ResponseEntity<ApiResponse<List<BookmarkResponse>>> getImportantBookmarks(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(bookmarkService.getImportantBookmarks(userId)));
    }

    @DeleteMapping("/{bookmarkId}")
    public ResponseEntity<ApiResponse<Void>> deleteBookmark(@PathVariable Long bookmarkId) {
        bookmarkService.deleteBookmark(bookmarkId);
        return ResponseEntity.ok(ApiResponse.ok(null, "Bookmark deleted"));
    }
}
