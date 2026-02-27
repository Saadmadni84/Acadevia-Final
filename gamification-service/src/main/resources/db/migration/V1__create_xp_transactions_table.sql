CREATE TABLE xp_transactions (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id         BIGINT NOT NULL,
    action_type     ENUM('QUIZ_COMPLETE', 'COURSE_COMPLETE', 'LESSON_COMPLETE',
                         'DAILY_STREAK', 'MULTIPLAYER_WIN', 'CHALLENGE',
                         'BADGE_BONUS', 'LOGIN_BONUS', 'STREAK_BONUS',
                         'GAME_COMPLETE', 'VIDEO_COMPLETE', 'POP_QUESTION',
                         'DAILY_CHALLENGE', 'COURSE_ENROLL', 'PERFECT_SCORE',
                         'SPEED_BONUS', 'LEVEL_UP_BONUS', 'FIRST_ACTION',
                         'WEEKLY_BONUS', 'ADMIN_GRANT') NOT NULL,
    xp_amount       INT NOT NULL,
    multiplier      DECIMAL(4,2) DEFAULT 1.00,
    final_xp        INT NOT NULL,
    
    -- Before/After for audit
    xp_before       BIGINT NOT NULL DEFAULT 0,
    xp_after        BIGINT NOT NULL DEFAULT 0,
    level_before    INT DEFAULT 1,
    level_after     INT DEFAULT 1,
    leveled_up      BOOLEAN DEFAULT FALSE,
    
    -- Reference to source
    reference_id    BIGINT,
    reference_type  VARCHAR(50),
    
    -- Context
    subject         VARCHAR(100),
    topic           VARCHAR(200),
    description     VARCHAR(500),
    
    -- Multiplier breakdown
    streak_multiplier   DECIMAL(3,2) DEFAULT 1.00,
    difficulty_multiplier DECIMAL(3,2) DEFAULT 1.00,
    bonus_multiplier    DECIMAL(3,2) DEFAULT 1.00,
    
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_xp_user (user_id),
    INDEX idx_xp_action (action_type),
    INDEX idx_xp_created (created_at),
    INDEX idx_xp_user_date (user_id, created_at),
    INDEX idx_xp_reference (reference_type, reference_id),
    INDEX idx_xp_leveled (leveled_up),
    INDEX idx_xp_subject (subject)
);
