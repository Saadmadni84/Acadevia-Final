CREATE TABLE user_badges (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id     BIGINT NOT NULL,
    badge_id    BIGINT NOT NULL,
    
    -- Context of earning
    trigger_action      VARCHAR(50),
    trigger_reference_id BIGINT,
    trigger_description VARCHAR(500),
    
    -- Reward granted
    xp_bonus_granted    INT DEFAULT 0,
    credit_bonus_granted INT DEFAULT 0,
    
    is_showcased    BOOLEAN DEFAULT FALSE,
    showcase_order  INT DEFAULT 0,
    
    earned_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (badge_id) REFERENCES badges(id),
    UNIQUE KEY uk_user_badge (user_id, badge_id),
    INDEX idx_ub_user (user_id),
    INDEX idx_ub_badge (badge_id),
    INDEX idx_ub_earned (earned_at DESC),
    INDEX idx_ub_showcased (user_id, is_showcased)
);
