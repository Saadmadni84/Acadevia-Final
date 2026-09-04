-- V12: Add class_grade, subject, and chapter columns to videos table
-- Allows querying uploaded content directly by class, subject, and chapter
-- and makes lesson_id nullable for module-level uploads.

ALTER TABLE videos
    MODIFY COLUMN lesson_id BIGINT NULL,
    ADD COLUMN class_grade INT NULL AFTER module_id,
    ADD COLUMN subject VARCHAR(100) NULL AFTER class_grade,
    ADD COLUMN chapter VARCHAR(255) NULL AFTER subject;

CREATE INDEX idx_videos_class_subject_chapter ON videos (class_grade, subject, chapter);
