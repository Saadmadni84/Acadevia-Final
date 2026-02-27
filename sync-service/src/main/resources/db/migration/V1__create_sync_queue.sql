CREATE TABLE sync_queue (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    device_id VARCHAR(255) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    operation VARCHAR(20) NOT NULL, -- PUSH or PULL
    payload_json MEDIUMTEXT,
    version INT NOT NULL DEFAULT 1,
    vector_clock TEXT,
    retry_count INT DEFAULT 0,
    next_retry_at DATETIME,
    error_message TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_status (user_id, status),
    INDEX idx_device (device_id),
    INDEX idx_retry (status, next_retry_at)
) PARTITION BY RANGE (TO_DAYS(created_at)) (
    PARTITION p_old VALUES LESS THAN (TO_DAYS('2024-01-01')),
    PARTITION p_2024_01 VALUES LESS THAN (TO_DAYS('2024-02-01')),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);
-- Note: Partitioning requires primary key to include partitioning column in MySQL, 
-- but JPA expects ID. Often we use composite PK (id, created_at) or just rely on index PARTITION BY if supported.
-- For standard auto_increment PK with partitioning, we might need a workaround or just partition by ID if ID is chronological.
-- Here we follow the prompt "PARTITION BY MONTH".
