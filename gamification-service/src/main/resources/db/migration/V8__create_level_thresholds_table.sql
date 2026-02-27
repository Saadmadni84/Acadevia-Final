CREATE TABLE level_thresholds (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    level_number    INT UNIQUE NOT NULL,
    level_name      VARCHAR(100) NOT NULL,
    level_name_local VARCHAR(200),
    min_xp          BIGINT NOT NULL,
    max_xp          BIGINT NOT NULL,
    badge_url       VARCHAR(500),
    frame_url       VARCHAR(500),
    color_code      VARCHAR(10),
    xp_bonus        INT DEFAULT 0,
    credit_bonus    INT DEFAULT 0,
    perks           JSON,
    
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_level (level_number),
    INDEX idx_level_xp (min_xp, max_xp)
);
