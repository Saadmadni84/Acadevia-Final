CREATE TABLE bandwidth_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    device_id VARCHAR(255),
    network_type VARCHAR(20),
    bandwidth_kbps DOUBLE,
    latency_ms INT,
    packet_loss_percent DOUBLE,
    state_code VARCHAR(10),
    city VARCHAR(100),
    logged_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    -- Partitioning by week would be added here if supported by DB structure
);
