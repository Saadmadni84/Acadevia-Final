CREATE TABLE wallet_transactions (
    id                  BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id             BIGINT NOT NULL,
    transaction_type    ENUM('CREDIT', 'DEBIT') NOT NULL,
    amount              DECIMAL(12,2) NOT NULL,
    balance_before      DECIMAL(12,2) NOT NULL,
    balance_after       DECIMAL(12,2) NOT NULL,
    source              ENUM('XP_CONVERSION', 'REWARD', 'PURCHASE',
                             'REFUND', 'BONUS', 'ADMIN_GRANT',
                             'STREAK_REWARD', 'COMPETITION_PRIZE') NOT NULL,
    reference_id        BIGINT,
    reference_type      VARCHAR(50),
    description         VARCHAR(500),
    
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_wallet_user (user_id),
    INDEX idx_wallet_type (transaction_type),
    INDEX idx_wallet_source (source),
    INDEX idx_wallet_created (created_at),
    INDEX idx_wallet_user_date (user_id, created_at)
);
