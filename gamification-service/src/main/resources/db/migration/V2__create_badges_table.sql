CREATE TABLE badges (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    name            VARCHAR(100) UNIQUE NOT NULL,
    display_name    VARCHAR(150) NOT NULL,
    display_name_local VARCHAR(300),
    description     VARCHAR(500) NOT NULL,
    description_local VARCHAR(1000),
    icon_url        VARCHAR(500),
    animated_icon_url VARCHAR(500),
    
    badge_type      ENUM('XP_MILESTONE', 'STREAK', 'COURSE_MASTERY',
                         'LEADERBOARD', 'QUIZ_MASTER', 'GAME_MASTER',
                         'SOCIAL', 'SPECIAL', 'SEASONAL',
                         'FIRST_ACTION', 'CONSISTENCY', 'SPEED') NOT NULL,
    
    rarity          ENUM('COMMON', 'UNCOMMON', 'RARE', 'EPIC', 
                         'LEGENDARY', 'MYTHIC') DEFAULT 'COMMON',
    
    -- Criteria
    criteria_type   VARCHAR(50) NOT NULL,
    criteria_value  INT NOT NULL,
    criteria_operator ENUM('GTE', 'LTE', 'EQ', 'GT', 'LT') DEFAULT 'GTE',
    secondary_criteria_type VARCHAR(50),
    secondary_criteria_value INT,
    
    -- Rewards
    xp_bonus        INT DEFAULT 0,
    credit_bonus    INT DEFAULT 0,
    
    -- Display
    category        VARCHAR(50),
    display_order   INT DEFAULT 0,
    
    -- Availability
    is_secret       BOOLEAN DEFAULT FALSE,
    is_limited      BOOLEAN DEFAULT FALSE,
    available_from  TIMESTAMP NULL,
    available_until TIMESTAMP NULL,
    max_earners     INT DEFAULT 0,
    current_earners INT DEFAULT 0,
    
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_badge_type (badge_type),
    INDEX idx_badge_rarity (rarity),
    INDEX idx_badge_criteria (criteria_type),
    INDEX idx_badge_active (is_active),
    INDEX idx_badge_category (category)
);
