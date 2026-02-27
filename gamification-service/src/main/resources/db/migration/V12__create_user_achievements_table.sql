CREATE TABLE user_achievements (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id         BIGINT NOT NULL,
    achievement_id  BIGINT NOT NULL,
    
    current_progress INT DEFAULT 0,
    target_value    INT NOT NULL,
    progress_pct    DECIMAL(5,2) DEFAULT 0.00,
    is_completed    BOOLEAN DEFAULT FALSE,
    
    xp_rewarded     INT DEFAULT 0,
    credits_rewarded INT DEFAULT 0,
    
    started_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at    TIMESTAMP NULL,
    
    FOREIGN KEY (achievement_id) REFERENCES achievements(id),
    UNIQUE KEY uk_user_achievement (user_id, achievement_id),
    INDEX idx_ua_user (user_id),
    INDEX idx_ua_achievement (achievement_id),
    INDEX idx_ua_completed (is_completed),
    INDEX idx_ua_progress (progress_pct)
);
