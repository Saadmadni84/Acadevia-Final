CREATE TABLE user_gamification_summaries (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id         BIGINT UNIQUE NOT NULL,
    
    -- XP
    total_xp        BIGINT DEFAULT 0,
    current_level   INT DEFAULT 1,
    xp_to_next_level INT DEFAULT 100,
    xp_progress_pct DECIMAL(5,2) DEFAULT 0.00,
    
    -- Credits
    total_credits   INT DEFAULT 0,
    credits_earned_total INT DEFAULT 0,
    credits_spent_total  INT DEFAULT 0,
    
    -- Wallet
    wallet_balance  DECIMAL(12,2) DEFAULT 0.00,
    
    -- Badges
    total_badges    INT DEFAULT 0,
    common_badges   INT DEFAULT 0,
    uncommon_badges INT DEFAULT 0,
    rare_badges     INT DEFAULT 0,
    epic_badges     INT DEFAULT 0,
    legendary_badges INT DEFAULT 0,
    mythic_badges   INT DEFAULT 0,
    
    -- Streaks
    current_streak  INT DEFAULT 0,
    longest_streak  INT DEFAULT 0,
    
    -- Activity
    total_quizzes_completed INT DEFAULT 0,
    total_games_completed   INT DEFAULT 0,
    total_courses_completed INT DEFAULT 0,
    total_lessons_completed INT DEFAULT 0,
    total_videos_completed  INT DEFAULT 0,
    total_daily_challenges  INT DEFAULT 0,
    
    -- Scores
    total_perfect_scores    INT DEFAULT 0,
    total_speed_bonuses     INT DEFAULT 0,
    
    -- Multiplier
    current_multiplier      DECIMAL(4,2) DEFAULT 1.00,
    
    last_xp_earned_at       TIMESTAMP NULL,
    last_badge_earned_at    TIMESTAMP NULL,
    
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_ugs_user (user_id),
    INDEX idx_ugs_xp (total_xp DESC),
    INDEX idx_ugs_level (current_level DESC),
    INDEX idx_ugs_badges (total_badges DESC),
    INDEX idx_ugs_streak (current_streak DESC)
);
