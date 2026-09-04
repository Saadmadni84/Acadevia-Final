-- V11: Add MinIO object storage metadata columns to videos table
-- These columns track the actual S3/MinIO object key and metadata
-- for videos uploaded to the acadevia-videos bucket.

ALTER TABLE videos
    ADD COLUMN object_key VARCHAR(500) NULL AFTER processing_error,
    ADD COLUMN bucket VARCHAR(100) NULL AFTER object_key,
    ADD COLUMN original_filename VARCHAR(500) NULL AFTER bucket,
    ADD COLUMN content_type VARCHAR(100) NULL AFTER original_filename,
    ADD COLUMN file_size_bytes BIGINT NULL AFTER content_type;

CREATE INDEX idx_videos_object_key ON videos (object_key);
