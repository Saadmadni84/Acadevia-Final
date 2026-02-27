CREATE TABLE sync_batch (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    batch_id VARCHAR(64) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    device_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    total_items INT DEFAULT 0,
    success_count INT DEFAULT 0,
    conflict_count INT DEFAULT 0,
    failure_count INT DEFAULT 0,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    bandwidth_kbps DOUBLE,
    network_type VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
