-- V13: Create video_comments table for student questions and teacher inbox
CREATE TABLE IF NOT EXISTS video_comments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    video_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_role VARCHAR(50) DEFAULT 'STUDENT',
    comment TEXT NOT NULL,
    is_read TINYINT(1) DEFAULT 0,
    is_resolved TINYINT(1) DEFAULT 0,
    reply TEXT,
    replied_by_name VARCHAR(255),
    replied_at DATETIME,
    parent_id BIGINT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_vc_video (video_id),
    INDEX idx_vc_user (user_id),
    INDEX idx_vc_read (is_read),
    INDEX idx_vc_created_at (created_at),
    CONSTRAINT fk_vc_video FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
);
