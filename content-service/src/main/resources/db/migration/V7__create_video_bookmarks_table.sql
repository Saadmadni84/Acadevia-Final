-- V7: Create video_bookmarks table
CREATE TABLE IF NOT EXISTS video_bookmarks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    video_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    timestamp_sec INT NOT NULL,
    title VARCHAR(500),
    note TEXT,
    color VARCHAR(20),
    is_important TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_bookmarks_user_id (user_id),
    INDEX idx_bookmarks_video_id (video_id),
    INDEX idx_bookmarks_timestamp (timestamp_sec),
    CONSTRAINT fk_bookmarks_video FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
