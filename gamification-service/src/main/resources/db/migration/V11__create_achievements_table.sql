CREATE TABLE achievements (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    name            VARCHAR(100) UNIQUE NOT NULL,
    display_name    VARCHAR(200) NOT NULL,
    description     VARCHAR(500),
    icon_url        VARCHAR(500),
    
    category        ENUM('LEARNING', 'SOCIAL', 'CONSISTENCY', 'MASTERY',
                         'SPEED', 'EXPLORATION', 'SPECIAL') NOT NULL,
    
    -- Tiered achievements (Bronze → Silver → Gold → Platinum)
    tier            ENUM('BRONZE', 'SILVER', 'GOLD', 'PLATINUM') DEFAULT 'BRONZE',
    
    criteria_type   VARCHAR(50) NOT NULL,
    criteria_value  INT NOT NULL,
    
    xp_reward       INT DEFAULT 0,
    credit_reward   INT DEFAULT 0,
    badge_id        BIGINT,
    
    display_order   INT DEFAULT 0,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (badge_id) REFERENCES badges(id),
    INDEX idx_ach_category (category),
    INDEX idx_ach_tier (tier),
    INDEX idx_ach_criteria (criteria_type),
    INDEX idx_ach_active (is_active)
);
