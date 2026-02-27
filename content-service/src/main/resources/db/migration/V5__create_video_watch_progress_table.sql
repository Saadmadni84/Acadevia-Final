-- V5: Create video_watch_progress table
CREATE TABLE IF NOT EXISTS video_watch_progress (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    video_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    last_position_sec INT DEFAULT 0,
    total_watched_sec INT DEFAULT 0,
    watch_percentage DOUBLE DEFAULT 0.0,
    is_completed TINYINT(1) DEFAULT 0,
    last_playback_speed DOUBLE,
    last_quality VARCHAR(20),
    rewatch_count INT DEFAULT 0,
    rewatched_sections JSON,
    session_count INT DEFAULT 0,
    first_watched_at DATETIME,
    last_watched_at DATETIME,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uk_watch_progress_video_user (video_id, user_id),
    INDEX idx_watch_progress_user_id (user_id),
    INDEX idx_watch_progress_completed (is_completed),
    CONSTRAINT fk_watch_progress_video FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
