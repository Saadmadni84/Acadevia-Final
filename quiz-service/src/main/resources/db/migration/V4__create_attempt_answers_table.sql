CREATE TABLE attempt_answers (
    id                  BIGINT PRIMARY KEY AUTO_INCREMENT,
    attempt_id          BIGINT NOT NULL,
    question_id         BIGINT NOT NULL,
    quiz_id             BIGINT NOT NULL,
    user_id             BIGINT NOT NULL,
    
    selected_answer     VARCHAR(500),
    selected_options    JSON,
    is_correct          BOOLEAN,
    is_skipped          BOOLEAN DEFAULT FALSE,
    is_marked_review    BOOLEAN DEFAULT FALSE,
    
    marks_awarded       DECIMAL(5,2) DEFAULT 0.00,
    negative_marks      DECIMAL(5,2) DEFAULT 0.00,
    time_taken_seconds  INT DEFAULT 0,
    hint_used           BOOLEAN DEFAULT FALSE,
    
    question_order      INT,
    answered_at         TIMESTAMP NULL,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id),
    INDEX idx_aa_attempt (attempt_id),
    INDEX idx_aa_question (question_id),
    INDEX idx_aa_user (user_id),
    INDEX idx_aa_correct (is_correct),
    INDEX idx_aa_quiz_user (quiz_id, user_id)
);
