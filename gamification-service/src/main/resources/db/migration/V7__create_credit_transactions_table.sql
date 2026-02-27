CREATE TABLE credit_transactions (
    id                  BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id             BIGINT NOT NULL,
    transaction_type    ENUM('EARN', 'SPEND') NOT NULL,
    amount              INT NOT NULL,
    balance_before      INT NOT NULL DEFAULT 0,
    balance_after       INT NOT NULL DEFAULT 0,
    source              ENUM('GAME_WIN', 'QUIZ_COMPLETE', 'STREAK_BONUS',
                             'CHALLENGE_WIN', 'DAILY_BONUS', 'BADGE_BONUS',
                             'LEVEL_UP', 'PURCHASE_HINT', 'PURCHASE_AVATAR',
                             'PURCHASE_THEME', 'PURCHASE_POWER_UP',
                             'XP_CONVERSION', 'ADMIN_GRANT', 'REFUND') NOT NULL,
    reference_id        BIGINT,
    reference_type      VARCHAR(50),
    description         VARCHAR(500),
    
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_credit_user (user_id),
    INDEX idx_credit_type (transaction_type),
    INDEX idx_credit_source (source),
    INDEX idx_credit_created (created_at)
);
