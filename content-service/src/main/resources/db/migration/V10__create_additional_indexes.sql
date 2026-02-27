-- V10: Create indexes for performance optimization
-- Additional composite indexes for common query patterns

-- Videos: composite index for lesson listing with sort
CREATE INDEX idx_videos_lesson_sort ON videos(lesson_id, sort_order, is_active);
CREATE INDEX idx_videos_course_sort ON videos(course_id, sort_order, is_active);
CREATE INDEX idx_videos_published_active ON videos(is_published, is_active);

-- Watch progress: user history queries
CREATE INDEX idx_watch_progress_user_watched ON video_watch_progress(user_id, last_watched_at DESC);
CREATE INDEX idx_watch_progress_completed_user ON video_watch_progress(user_id, is_completed);

-- Pop questions: video questions ordered by timestamp
CREATE INDEX idx_pop_questions_video_sort ON video_pop_questions(video_id, timestamp_sec, is_active);

-- Pop responses: user answer tracking
CREATE INDEX idx_pop_responses_user_correct ON video_pop_responses(user_id, is_correct);

-- Downloads: active downloads per user
CREATE INDEX idx_downloads_user_status ON video_downloads(user_id, download_status, deleted_at);
CREATE INDEX idx_downloads_expires ON video_downloads(expires_at, deleted_at);

-- Bookmarks: user video bookmarks
CREATE INDEX idx_bookmarks_video_user ON video_bookmarks(video_id, user_id, timestamp_sec);
CREATE INDEX idx_bookmarks_important ON video_bookmarks(user_id, is_important);

-- Notes: user video notes
CREATE INDEX idx_notes_video_user ON video_notes(video_id, user_id, timestamp_sec);
