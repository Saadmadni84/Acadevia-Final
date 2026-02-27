CREATE TABLE questions (
    id                  BIGINT PRIMARY KEY AUTO_INCREMENT,
    quiz_id             BIGINT,
    
    -- Question Content
    question_text       TEXT NOT NULL,
    question_type       ENUM('MCQ', 'TRUE_FALSE', 'FILL_BLANK', 
                             'MULTI_SELECT', 'SHORT_ANSWER',
                             'MATCH_PAIRS', 'ORDERING') NOT NULL,
    
    -- Options (for MCQ, TRUE_FALSE, MULTI_SELECT)
    option_a            VARCHAR(500),
    option_b            VARCHAR(500),
    option_c            VARCHAR(500),
    option_d            VARCHAR(500),
    option_e            VARCHAR(500),
    option_f            VARCHAR(500),
    
    -- Answer
    correct_answer      VARCHAR(500) NOT NULL,
    correct_options     JSON,
    
    -- Explanation
    explanation         TEXT,
    solution_steps      JSON,
    hint                TEXT,
    
    -- Media
    question_image_url  VARCHAR(500),
    explanation_image_url VARCHAR(500),
    question_audio_url  VARCHAR(500),
    
    -- Classification
    subject             VARCHAR(100) NOT NULL,
    class_grade         INT NOT NULL,
    board               VARCHAR(50) DEFAULT 'ALL',
    topic               VARCHAR(200) NOT NULL,
    concept             VARCHAR(200),
    chapter             VARCHAR(200),
    difficulty_level    ENUM('EASY', 'MEDIUM', 'HARD') NOT NULL DEFAULT 'MEDIUM',
    language            VARCHAR(20) DEFAULT 'en',
    tags                JSON,
    
    -- Scoring
    marks               INT DEFAULT 1,
    xp_value            INT DEFAULT 5,
    time_expected_sec   INT DEFAULT 60,
    
    -- Stats (updated by grading)
    total_attempts      INT DEFAULT 0,
    correct_count       INT DEFAULT 0,
    accuracy_pct        DECIMAL(5,2) DEFAULT 0.00,
    avg_time_sec        DECIMAL(7,2) DEFAULT 0.00,
    discrimination_index DECIMAL(5,3) DEFAULT 0.00,
    
    -- Question Bank flags
    is_bank_question    BOOLEAN DEFAULT FALSE,
    is_verified         BOOLEAN DEFAULT FALSE,
    verified_by         BIGINT,
    source              VARCHAR(200),
    
    -- Order
    sequence_order      INT DEFAULT 0,
    
    -- Ownership
    created_by          BIGINT NOT NULL,
    school_id           BIGINT,
    
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
                        ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE SET NULL,
    INDEX idx_q_quiz (quiz_id),
    INDEX idx_q_type (question_type),
    INDEX idx_q_subject (subject),
    INDEX idx_q_class (class_grade),
    INDEX idx_q_board (board),
    INDEX idx_q_topic (topic),
    INDEX idx_q_concept (concept),
    INDEX idx_q_difficulty (difficulty_level),
    INDEX idx_q_language (language),
    INDEX idx_q_bank (is_bank_question),
    INDEX idx_q_verified (is_verified),
    INDEX idx_q_creator (created_by),
    INDEX idx_q_active (is_active),
    INDEX idx_q_accuracy (accuracy_pct),
    INDEX idx_q_topic_difficulty (topic, difficulty_level),
    FULLTEXT idx_q_search (question_text, topic, concept)
);
