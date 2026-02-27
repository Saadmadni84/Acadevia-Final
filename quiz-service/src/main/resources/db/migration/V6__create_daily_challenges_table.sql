CREATE TABLE daily_challenges (
    id                  BIGINT PRIMARY KEY AUTO_INCREMENT,
    challenge_date      DATE NOT NULL,
    class_grade         INT NOT NULL,
    subject             VARCHAR(100) NOT NULL,
    board               VARCHAR(50) DEFAULT 'ALL',
    language            VARCHAR(20) DEFAULT 'en',
    
    title               VARCHAR(255) NOT NULL,
    description         TEXT,
    
    -- Quiz reference (auto-generated quiz)
    quiz_id             BIGINT,
    
    -- Configuration
    total_questions     INT DEFAULT 10,
    time_limit_minutes  INT DEFAULT 10,
    difficulty_level    VARCHAR(20) DEFAULT 'MIXED',
    
    -- Rewards
    xp_reward           INT DEFAULT 30,
    credit_reward       INT DEFAULT 3,
    streak_bonus_xp     INT DEFAULT 10,
    
    -- Stats
    total_participants  INT DEFAULT 0,
    avg_score_pct       DECIMAL(5,2) DEFAULT 0.00,
    highest_score       INT DEFAULT 0,
    
    -- Topics covered
    topics              JSON,
    
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id),
    UNIQUE KEY uk_daily_challenge (challenge_date, class_grade, subject),
    INDEX idx_dc_date (challenge_date),
    INDEX idx_dc_class (class_grade),
    INDEX idx_dc_subject (subject),
    INDEX idx_dc_active (is_active)
);
