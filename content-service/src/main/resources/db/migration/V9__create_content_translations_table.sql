-- V9: Create content_translations table
CREATE TABLE IF NOT EXISTS content_translations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    content_type VARCHAR(50) NOT NULL,
    content_id BIGINT NOT NULL,
    field_name VARCHAR(100) NOT NULL,
    language_code VARCHAR(10) NOT NULL,
    translated_value TEXT NOT NULL,
    is_auto_translated TINYINT(1) DEFAULT 0,
    is_verified TINYINT(1) DEFAULT 0,
    verified_by BIGINT,
    verified_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uk_translation_content_field_lang (content_type, content_id, field_name, language_code),
    INDEX idx_translations_content (content_type, content_id),
    INDEX idx_translations_language (language_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
