-- V8: Create video_notes table
CREATE TABLE IF NOT EXISTS video_notes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    video_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    timestamp_sec INT NOT NULL,
    content TEXT NOT NULL,
    formatted_content TEXT,
    has_drawing TINYINT(1) DEFAULT 0,
    drawing_data LONGTEXT,
    screenshot_url VARCHAR(1000),
    is_pinned TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_notes_user_id (user_id),
    INDEX idx_notes_video_id (video_id),
    INDEX idx_notes_timestamp (timestamp_sec),
    INDEX idx_notes_pinned (is_pinned),
    CONSTRAINT fk_notes_video FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
