-- Acadevia SQL Seed Script for Shared Cloudflare R2 Video Record
-- Database: acadevia_content
-- Usage:
--   docker exec -i acadevia-mysql mysql -u root -proot_password acadevia_content < seed-r2-video.sql
-- or for remote MySQL:
--   mysql -h <HOST> -u <USER> -p acadevia_content < seed-r2-video.sql

USE acadevia_content;

INSERT INTO videos (
    id,
    title,
    description,
    lesson_id,
    course_id,
    module_id,
    class_grade,
    subject,
    chapter,
    is_preview,
    is_mandatory,
    is_downloadable,
    is_active,
    is_published,
    is_processing,
    processing_status,
    object_key,
    bucket,
    original_filename,
    content_type,
    file_size_bytes,
    file_size_mb,
    access_level,
    language_code,
    created_by,
    created_at,
    updated_at
) VALUES (
    3,
    'Real Numbers',
    'Comprehensive Chapter 1 coverage of Real Numbers for Class 10 CBSE/State Board. Covers Euclid\'s Division Lemma, Fundamental Theorem of Arithmetic, and proofs of irrationality.',
    1,
    1,
    1,
    10,
    'Mathematics',
    'Real Numbers',
    0,
    1,
    1,
    1,
    1,
    0,
    'UPLOADED',
    'videos/10/1/1bf07910-3851-452f-b361-ee0bfe1760aa.mp4',
    'acadevia-videos',
    'Real Numbers Class 10  Maths Full chapter in One Shot  NCERT Chapter 1  CBSE New Syllabus  10th_720p.mp4',
    'video/mp4',
    428691985,
    408.83,
    'ENROLLED',
    'en',
    30,
    NOW(),
    NOW()
) ON DUPLICATE KEY UPDATE
    title = VALUES(title),
    description = VALUES(description),
    lesson_id = VALUES(lesson_id),
    course_id = VALUES(course_id),
    module_id = VALUES(module_id),
    class_grade = VALUES(class_grade),
    subject = VALUES(subject),
    chapter = VALUES(chapter),
    object_key = VALUES(object_key),
    bucket = VALUES(bucket),
    original_filename = VALUES(original_filename),
    content_type = VALUES(content_type),
    file_size_bytes = VALUES(file_size_bytes),
    file_size_mb = VALUES(file_size_mb),
    is_active = 1,
    is_published = 1,
    is_downloadable = 1;

SELECT 'Class 10 Real Numbers video record seeded successfully!' AS status;
