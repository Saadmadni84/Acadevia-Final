CREATE TABLE quiz_attempts (
    id                  BIGINT PRIMARY KEY AUTO_INCREMENT,
    quiz_id             BIGINT NOT NULL,
    user_id             BIGINT NOT NULL,
    
    -- Status
    status              ENUM('IN_PROGRESS', 'SUBMITTED', 'AUTO_SUBMITTED',
                             'TIMED_OUT', 'ABANDONED') DEFAULT 'IN_PROGRESS',
    attempt_number      INT DEFAULT 1,
    
    -- Scoring
    score               INT NOT NULL DEFAULT 0,
    total_marks         INT NOT NULL,
    percentage          DECIMAL(5,2) DEFAULT 0.00,
    is_passed           BOOLEAN DEFAULT FALSE,
    
    -- Question breakdown
    total_questions     INT NOT NULL,
    correct_answers     INT DEFAULT 0,
    wrong_answers       INT DEFAULT 0,
    skipped_answers     INT DEFAULT 0,
    
    -- Negative marking
    negative_marks      DECIMAL(5,2) DEFAULT 0.00,
    net_score           DECIMAL(7,2) DEFAULT 0.00,
    
    -- Time
    time_limit_seconds  INT,
    time_taken_seconds  INT DEFAULT 0,
    avg_time_per_question DECIMAL(7,2) DEFAULT 0.00,
    
    -- XP and rewards
    xp_earned           INT DEFAULT 0,
    credits_earned      INT DEFAULT 0,
    xp_multiplier       DECIMAL(3,2) DEFAULT 1.00,
    is_perfect_score    BOOLEAN DEFAULT FALSE,
    is_speed_bonus      BOOLEAN DEFAULT FALSE,
    
    -- Adaptive info
    difficulty_level    VARCHAR(20),
    adaptive_score      DECIMAL(5,2),
    
    -- Answers stored as JSON for quick retrieval
    answers_json        JSON,
    
    -- Question order (shuffled)
    question_order      JSON,
    
    started_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    submitted_at        TIMESTAMP NULL,
    completed_at        TIMESTAMP NULL,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id),
    INDEX idx_qa_quiz (quiz_id),
    INDEX idx_qa_user (user_id),
    INDEX idx_qa_user_quiz (user_id, quiz_id),
    INDEX idx_qa_status (status),
    INDEX idx_qa_score (percentage DESC),
    INDEX idx_qa_started (started_at DESC),
    INDEX idx_qa_attempt (user_id, quiz_id, attempt_number)
);
