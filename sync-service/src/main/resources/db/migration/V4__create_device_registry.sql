CREATE TABLE device_registry (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id VARCHAR(255) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    device_name VARCHAR(255),
    device_type VARCHAR(50),
    os_version VARCHAR(50),
    app_version VARCHAR(50),
    fcm_token VARCHAR(255),
    total_storage_mb DOUBLE,
    free_storage_mb DOUBLE,
    active BOOLEAN DEFAULT TRUE,
    last_sync_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_active (user_id, active)
);
