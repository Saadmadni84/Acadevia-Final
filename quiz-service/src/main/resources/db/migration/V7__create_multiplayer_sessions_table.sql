CREATE TABLE multiplayer_sessions (
    id                  BIGINT PRIMARY KEY AUTO_INCREMENT,
    session_code        VARCHAR(10) UNIQUE NOT NULL,
    quiz_id             BIGINT NOT NULL,
    
    -- Host
    host_user_id        BIGINT NOT NULL,
    
    -- Configuration
    max_players         INT DEFAULT 4,
    current_players     INT DEFAULT 0,
    
    -- Status
    status              ENUM('WAITING', 'IN_PROGRESS', 'COMPLETED', 
                             'CANCELLED', 'EXPIRED') DEFAULT 'WAITING',
    
    -- Timing
    question_time_sec   INT DEFAULT 20,
    break_time_sec      INT DEFAULT 3,
    current_question    INT DEFAULT 0,
    total_questions     INT NOT NULL,
    
    -- Settings
    is_public           BOOLEAN DEFAULT FALSE,
    allow_late_join     BOOLEAN DEFAULT FALSE,
    show_live_scores    BOOLEAN DEFAULT TRUE,
    
    -- Results
    winner_user_id      BIGINT,
    
    -- Metadata
    subject             VARCHAR(100),
    class_grade         INT,
    topic               VARCHAR(200),
    
    started_at          TIMESTAMP NULL,
    ended_at            TIMESTAMP NULL,
    expires_at          TIMESTAMP NOT NULL,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id),
    INDEX idx_ms_code (session_code),
    INDEX idx_ms_host (host_user_id),
    INDEX idx_ms_status (status),
    INDEX idx_ms_quiz (quiz_id),
    INDEX idx_ms_subject (subject),
    INDEX idx_ms_expires (expires_at)
);
