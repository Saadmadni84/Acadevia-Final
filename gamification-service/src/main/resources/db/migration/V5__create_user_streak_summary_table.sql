CREATE TABLE user_streak_summaries (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id         BIGINT UNIQUE NOT NULL,
    
    current_streak  INT DEFAULT 0,
    longest_streak  INT DEFAULT 0,
    total_active_days INT DEFAULT 0,
    
    streak_start_date DATE,
    last_active_date  DATE,
    
    -- Streak freeze (future feature)
    streak_freezes_available INT DEFAULT 0,
    streak_freezes_used     INT DEFAULT 0,
    
    -- Current multiplier based on streak
    current_multiplier DECIMAL(3,2) DEFAULT 1.00,
    
    -- Notifications
    streak_at_risk  BOOLEAN DEFAULT FALSE,
    
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_uss_user (user_id),
    INDEX idx_uss_streak (current_streak DESC),
    INDEX idx_uss_longest (longest_streak DESC),
    INDEX idx_uss_last_active (last_active_date)
);
