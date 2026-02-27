-- V3: Create video_pop_responses table
CREATE TABLE IF NOT EXISTS video_pop_responses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    pop_question_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    selected_option VARCHAR(10) NOT NULL,
    is_correct TINYINT(1) DEFAULT 0,
    response_time_sec DOUBLE,
    attempt_number INT DEFAULT 1,
    xp_earned INT DEFAULT 0,
    answered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uk_pop_response_question_user (pop_question_id, user_id),
    INDEX idx_pop_responses_user_id (user_id),
    INDEX idx_pop_responses_question_id (pop_question_id),
    CONSTRAINT fk_pop_responses_question FOREIGN KEY (pop_question_id) REFERENCES video_pop_questions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
