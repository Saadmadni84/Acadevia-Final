-- V4: Create video_subtitles table
CREATE TABLE IF NOT EXISTS video_subtitles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    video_id BIGINT NOT NULL,
    language_code VARCHAR(10) NOT NULL,
    language_name VARCHAR(100),
    subtitle_url VARCHAR(1000) NOT NULL,
    subtitle_format VARCHAR(20) DEFAULT 'VTT',
    is_auto_generated TINYINT(1) DEFAULT 0,
    is_default TINYINT(1) DEFAULT 0,
    is_verified TINYINT(1) DEFAULT 0,
    verified_by BIGINT,
    created_by BIGINT,
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uk_subtitle_video_lang (video_id, language_code),
    INDEX idx_subtitles_video_id (video_id),
    CONSTRAINT fk_subtitles_video FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
