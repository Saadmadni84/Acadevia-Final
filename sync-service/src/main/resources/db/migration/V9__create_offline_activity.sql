CREATE TABLE offline_activity (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    activity_id VARCHAR(64) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    device_id VARCHAR(255),
    activity_type VARCHAR(50), -- QUIZ_COMPLETED, VIDEO_WATCHED etc
    payload_json MEDIUMTEXT,
    occurred_at DATETIME,
    processed BOOLEAN DEFAULT FALSE,
    processed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
