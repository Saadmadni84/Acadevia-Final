CREATE TABLE daily_streaks (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id     BIGINT NOT NULL,
    streak_date DATE NOT NULL,
    
    login_time  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- What did user do on this day
    activities  JSON,
    xp_earned_today INT DEFAULT 0,
    
    is_active   BOOLEAN DEFAULT TRUE,
    
    UNIQUE KEY uk_user_date (user_id, streak_date),
    INDEX idx_streak_user (user_id),
    INDEX idx_streak_date (streak_date),
    INDEX idx_streak_active (is_active)
);
