CREATE TABLE gamification_rules (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    rule_name       VARCHAR(100) UNIQUE NOT NULL,
    action_type     VARCHAR(50) NOT NULL,
    display_name    VARCHAR(200) NOT NULL,
    description     VARCHAR(500),
    
    -- XP config
    xp_value        INT NOT NULL,
    min_xp          INT DEFAULT 0,
    max_xp          INT DEFAULT 0,
    
    -- Credit config
    credit_value    INT DEFAULT 0,
    
    -- Conditions
    condition_type  VARCHAR(50),
    condition_value VARCHAR(200),
    
    -- Cooldown
    cooldown_minutes INT DEFAULT 0,
    max_per_day     INT DEFAULT 0,
    
    -- Category
    category        VARCHAR(50),
    
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_rule_action (action_type),
    INDEX idx_rule_active (is_active),
    INDEX idx_rule_category (category)
);
