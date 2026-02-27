CREATE TABLE IF NOT EXISTS courses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    short_description VARCHAR(500),
    cover_image_url VARCHAR(255),
    promotional_video_url VARCHAR(255),
    category VARCHAR(50),
    subject VARCHAR(50),
    class_grade INT,
    education_board VARCHAR(50),
    language VARCHAR(50),
    price DOUBLE,
    discount_price DOUBLE,
    instructor_id BIGINT NOT NULL,
    status VARCHAR(20) DEFAULT 'DRAFT',
    enrollment_count INT DEFAULT 0,
    average_rating DOUBLE DEFAULT 0.0,
    review_count INT DEFAULT 0,
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    published_at DATETIME,
    featured BOOLEAN DEFAULT FALSE,
    learning_points JSON,
    requirements JSON,
    tags JSON,
    INDEX idx_instructor (instructor_id),
    INDEX idx_status (status),
    INDEX idx_category (category),
    INDEX idx_subject (subject),
    INDEX idx_class_grade (class_grade)
);

CREATE TABLE IF NOT EXISTS modules (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INT NOT NULL,
    course_id BIGINT NOT NULL,
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS lessons (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL,
    content_url VARCHAR(500),
    duration_seconds INT,
    order_index INT NOT NULL,
    is_preview BOOLEAN DEFAULT FALSE,
    metadata JSON,
    module_id BIGINT NOT NULL,
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS course_enrollments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    enrolled_at DATETIME NOT NULL,
    completed_at DATETIME,
    status VARCHAR(20) NOT NULL,
    completion_percentage DOUBLE DEFAULT 0.0,
    last_accessed DATETIME,
    certificate_url VARCHAR(255),
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_course (user_id, course_id)
);

CREATE TABLE IF NOT EXISTS lesson_progress (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    lesson_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL,
    time_spent_seconds INT DEFAULT 0,
    last_position INT DEFAULT 0,
    progress_percentage DOUBLE DEFAULT 0.0,
    last_accessed DATETIME,
    completed_at DATETIME,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_lesson (user_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS course_reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    rating INT NOT NULL,
    comment TEXT,
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    helpful_count INT DEFAULT 0,
    teacher_reply TEXT,
    replied_at DATETIME,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_course_review (user_id, course_id)
);

CREATE TABLE IF NOT EXISTS course_favorites (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    created_at DATETIME NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_course_fav (user_id, course_id)
);
