package com.acadevia.content.service;

import com.acadevia.content.dto.request.BookmarkCreateRequest;
import com.acadevia.content.dto.request.BookmarkUpdateRequest;
import com.acadevia.content.dto.response.BookmarkResponse;
import com.acadevia.content.dto.response.PageResponse;

import java.util.List;

public interface BookmarkService {

    BookmarkResponse createBookmark(BookmarkCreateRequest request);

    BookmarkResponse updateBookmark(Long bookmarkId, BookmarkUpdateRequest request);

    List<BookmarkResponse> getBookmarksByVideoAndUser(Long videoId, Long userId);

    PageResponse<BookmarkResponse> getUserBookmarks(Long userId, int pageNo, int pageSize);

    List<BookmarkResponse> getImportantBookmarks(Long userId);

    void deleteBookmark(Long bookmarkId);
}
