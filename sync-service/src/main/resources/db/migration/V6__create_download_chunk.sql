CREATE TABLE download_chunk (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    chunk_id VARCHAR(64) NOT NULL UNIQUE,
    manifest_id BIGINT NOT NULL,
    chunk_index INT NOT NULL,
    start_byte BIGINT,
    end_byte BIGINT,
    checksum_sha256 VARCHAR(64) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    download_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (manifest_id) REFERENCES download_manifest(id) ON DELETE CASCADE,
    INDEX idx_manifest (manifest_id)
);
