CREATE TABLE refresh_tokens (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id     BIGINT NOT NULL,
    token       VARCHAR(500) UNIQUE NOT NULL,
    device_info VARCHAR(255),
    ip_address  VARCHAR(50),
    expires_at  TIMESTAMP NOT NULL,
    is_revoked  BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_refresh_token (token),
    INDEX idx_refresh_user (user_id),
    INDEX idx_refresh_expiry (expires_at)
);
