CREATE TABLE content_cache (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    content_id VARCHAR(255) NOT NULL,
    content_type VARCHAR(50) NOT NULL,
    available_qualities JSON, -- e.g. ["720p", "480p"]
    target_states JSON,      -- e.g. ["MH", "UP"]
    file_size_map JSON,      -- e.g. {"720p": 5000000}
    cdn_base_url VARCHAR(255),
    active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_content (content_type, content_id)
);
