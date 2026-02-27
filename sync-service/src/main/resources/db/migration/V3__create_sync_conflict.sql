CREATE TABLE sync_conflict (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    conflict_id VARCHAR(64) NOT NULL UNIQUE,
    sync_queue_id BIGINT,
    user_id BIGINT NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(255) NOT NULL,
    client_payload MEDIUMTEXT,
    server_payload MEDIUMTEXT,
    resolved BOOLEAN DEFAULT FALSE,
    resolution_strategy VARCHAR(50),
    resolved_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sync_queue_id) REFERENCES sync_queue(id) ON DELETE SET NULL
);
